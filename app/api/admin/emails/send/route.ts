import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import { sendBulkEmail } from "@/lib/email";
import { mdxToEmailHtml } from "@/lib/mdx-to-html";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/sanitize";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function POST(request: Request) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subject, content, recipientFilter, turnstileToken } =
    await request.json();

  if (!subject?.trim() || !content?.trim()) {
    return NextResponse.json(
      { error: "Subject and content are required" },
      { status: 400 },
    );
  }

  const ip = getClientIp(request);
  const sendRateLimit = rateLimit(`admin:send-email:${ip}`, 4, 15 * 60 * 1000);
  if (!sendRateLimit.success) {
    return NextResponse.json(
      { error: "Too many send attempts. Please try again later." },
      { status: 429 },
    );
  }

  const turnstileResult = await verifyTurnstileToken({
    token: turnstileToken,
    ip,
    action: "admin-send-email",
  });

  if (!turnstileResult.success) {
    return NextResponse.json({ error: turnstileResult.error }, { status: 400 });
  }

  const sql = getDb();
  const emailId = nanoid();

  await sql`
    INSERT INTO email_sends (id, subject, content_mdx, recipient_filter, status)
    VALUES (${emailId}, ${subject}, ${content}, ${recipientFilter || "confirmed"}, 'sending')
  `;

  try {
    const subscribers =
      recipientFilter === "marketing"
        ? await sql`
            SELECT id, email, first_name, last_name FROM subscribers
            WHERE status = 'confirmed' AND marketing_emails = true
          `
        : await sql`
            SELECT id, email, first_name, last_name FROM subscribers
            WHERE status = 'confirmed'
          `;

    const htmlContent = mdxToEmailHtml(content);
    let sentCount = 0;

    for (const sub of subscribers) {
      try {
        await sendBulkEmail({
          subscriberId: sub.id,
          to: sub.email,
          firstName: sub.first_name,
          lastName: sub.last_name,
          subject,
          htmlContent,
        });
        sentCount++;
      } catch (err) {
        console.error(`Failed to send to ${sub.email}:`, err);
      }
    }

    await sql`
      UPDATE email_sends
      SET status = 'sent', sent_count = ${sentCount}, sent_at = NOW()
      WHERE id = ${emailId}
    `;

    await logAudit({
      action: "email.sent",
      entityType: "email",
      entityId: emailId,
      actor: "admin",
      metadata: { subject, sentCount, recipientFilter },
    });

    return NextResponse.json({ ok: true, sentCount });
  } catch (error) {
    await sql`
      UPDATE email_sends SET status = 'failed' WHERE id = ${emailId}
    `;
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: "Failed to send emails" },
      { status: 500 },
    );
  }
}
