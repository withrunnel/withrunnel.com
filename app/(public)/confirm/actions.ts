"use server";

import { logAudit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request-context";
import {
  TURNSTILE_RESPONSE_FIELD,
  verifyTurnstileToken,
} from "@/lib/turnstile";

export type ConfirmActionState = {
  success: boolean;
  email?: string;
  error?: string;
  requiresRejoin?: boolean;
} | null;

export async function completeConfirmationAction(
  _prev: ConfirmActionState,
  formData: FormData,
): Promise<ConfirmActionState> {
  const confirmationToken = formData.get("token");
  if (typeof confirmationToken !== "string" || !confirmationToken) {
    return { success: false, error: "Missing confirmation token." };
  }

  const sql = getDb();
  const rows = await sql`
    SELECT id, email, first_name, last_name, status, confirmation_token_expires_at
    FROM subscribers
    WHERE confirmation_token = ${confirmationToken}
  `;

  if (rows.length === 0) {
    return {
      success: false,
      error: "This confirmation link is invalid or has already been used.",
    };
  }

  const subscriber = rows[0];

  if (
    subscriber.confirmation_token_expires_at &&
    new Date(subscriber.confirmation_token_expires_at) < new Date()
  ) {
    await sql`
      DELETE FROM subscribers
      WHERE id = ${subscriber.id}
        AND status = 'pending_confirmation'
    `;

    return {
      success: false,
      error:
        "This confirmation link expired and your signup was removed. Please join the waitlist again.",
      requiresRejoin: true,
    };
  }

  if (subscriber.status === "confirmed") {
    return { success: true, email: subscriber.email };
  }

  const ip = await getRequestIp();
  const ipRateLimit = rateLimit(`confirm:ip:${ip}`, 5, 15 * 60 * 1000);
  const emailRateLimit = rateLimit(
    `confirm:email:${subscriber.email}`,
    3,
    15 * 60 * 1000,
  );

  if (!ipRateLimit.success || !emailRateLimit.success) {
    return {
      success: false,
      error: "Too many email requests. Please try again later.",
    };
  }

  const turnstileResult = await verifyTurnstileToken({
    token: formData.get(TURNSTILE_RESPONSE_FIELD),
    ip,
    action: "confirm-email",
  });

  if (!turnstileResult.success) {
    return { success: false, error: turnstileResult.error };
  }

  await sql`
    UPDATE subscribers
    SET status = 'confirmed',
        confirmed_at = NOW(),
        confirmation_token = NULL,
        confirmation_token_expires_at = NULL,
        updated_at = NOW()
    WHERE id = ${subscriber.id}
  `;

  await logAudit({
    action: "subscriber.confirmed",
    entityType: "subscriber",
    entityId: subscriber.id,
    metadata: { email: subscriber.email },
  });

  try {
    await sendWelcomeEmail({
      subscriberId: subscriber.id,
      to: subscriber.email,
      firstName: subscriber.first_name,
      lastName: subscriber.last_name,
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }

  return {
    success: true,
    email: subscriber.email,
  };
}
