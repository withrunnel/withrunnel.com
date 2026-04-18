import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { logAudit } from "@/lib/audit";
import {
  deleteExpiredPendingSubscribers,
  getConfirmationTokenExpiry,
  getDb,
} from "@/lib/db";
import { sendConfirmationEmail, sendWelcomeEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp, sanitizeEmail } from "@/lib/sanitize";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function POST(request: Request) {
  try {
    const { email, turnstileToken } = await request.json();
    const sanitized = sanitizeEmail(email);
    if (!sanitized) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const ip = getClientIp(request);
    const ipRateLimit = rateLimit(`resend:ip:${ip}`, 5, 15 * 60 * 1000);
    const emailRateLimit = rateLimit(
      `resend:email:${sanitized}`,
      3,
      15 * 60 * 1000,
    );
    if (!ipRateLimit.success || !emailRateLimit.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const turnstileResult = await verifyTurnstileToken({
      token: turnstileToken,
      ip,
      action: "resend-email",
    });

    if (!turnstileResult.success) {
      return NextResponse.json(
        { error: turnstileResult.error },
        { status: 400 },
      );
    }

    const sql = getDb();
    await deleteExpiredPendingSubscribers({ email: sanitized });

    const rows = await sql`
      SELECT id, first_name, last_name, status FROM subscribers WHERE email = ${sanitized}
    `;

    if (rows.length === 0) {
      return NextResponse.json({ ok: true });
    }

    const sub = rows[0];

    if (sub.status === "pending_confirmation") {
      const token = nanoid(32);
      const expiry = getConfirmationTokenExpiry();

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
        subscriberId: sub.id,
        to: sanitized,
        firstName: sub.first_name,
        lastName: sub.last_name,
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
