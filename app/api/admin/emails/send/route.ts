import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import { sendBulkEmail } from "@/lib/email";
import { mdxToEmailHtml } from "@/lib/mdx-to-html";

export async function POST(request: Request) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subject, content, recipientFilter } = await request.json();

  if (!subject?.trim() || !content?.trim()) {
    return NextResponse.json(
      { error: "Subject and content are required" },
      { status: 400 },
    );
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
            SELECT email, first_name FROM subscribers
            WHERE status = 'confirmed' AND marketing_emails = true
          `
        : await sql`
            SELECT email, first_name FROM subscribers
            WHERE status = 'confirmed'
          `;

    const htmlContent = mdxToEmailHtml(content);
    let sentCount = 0;

    for (const sub of subscribers) {
      try {
        await sendBulkEmail({
          to: sub.email,
          firstName: sub.first_name,
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
