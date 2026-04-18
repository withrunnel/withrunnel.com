import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { logAudit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import { sendConfirmationEmail, sendWelcomeEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp, sanitizeEmail } from "@/lib/sanitize";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const sanitized = sanitizeEmail(email);
    if (!sanitized) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const ip = getClientIp(request);
    const rl = rateLimit(`resend:${ip}`, 5, 15 * 60 * 1000);
    if (!rl.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const sql = getDb();
    const rows = await sql`
      SELECT id, first_name, status FROM subscribers WHERE email = ${sanitized}
    `;

    if (rows.length === 0) {
      return NextResponse.json({ ok: true });
    }

    const sub = rows[0];

    if (sub.status === "pending_confirmation") {
      const token = nanoid(32);
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await sql`
        UPDATE subscribers
        SET confirmation_token = ${token},
            confirmation_token_expires_at = ${expiry.toISOString()},
            updated_at = NOW()
        WHERE id = ${sub.id}
      `;

      await sendConfirmationEmail({
        to: sanitized,
        firstName: sub.first_name,
        confirmationToken: token,
      });
    } else if (sub.status === "confirmed") {
      await sendWelcomeEmail({
        to: sanitized,
        firstName: sub.first_name,
      });
    }

    await logAudit({
      action: "subscriber.resend_confirmation",
      entityType: "subscriber",
      entityId: sub.id,
      ipAddress: ip,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
