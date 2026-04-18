"use server";

import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { logAudit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import { sendConfirmationEmail } from "@/lib/email";
import {
  findSubscriberForEmailManagement,
  verifyEmailManagementToken,
} from "@/lib/email-management";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIpFromHeaders } from "@/lib/request-context";
import { sanitizeInput } from "@/lib/sanitize";
import {
  TURNSTILE_RESPONSE_FIELD,
  verifyTurnstileToken,
} from "@/lib/turnstile";

type ResubState = { success: boolean; error?: string } | null;

export async function resubscribeAction(
  _prev: ResubState,
  formData: FormData,
): Promise<ResubState> {
  const token = formData.get("token");
  if (typeof token !== "string" || !token) {
    return { success: false, error: "Missing resubscribe token." };
  }

  const claims = await verifyEmailManagementToken(token);
  if (!claims) {
    return {
      success: false,
      error: "This resubscribe link is invalid or has expired.",
    };
  }

  const email = claims.email;
  const firstName = sanitizeInput(claims.firstName || "");
  const lastName = sanitizeInput(claims.lastName || "");
  const ip = getClientIpFromHeaders(await headers());

  const emailRateLimit = rateLimit(`resub:email:${email}`, 3, 15 * 60 * 1000);
  const ipRateLimit = rateLimit(`resub:ip:${ip}`, 6, 15 * 60 * 1000);
  if (!emailRateLimit.success || !ipRateLimit.success) {
    return {
      success: false,
      error: "Too many email requests. Please try again later.",
    };
  }

  const sql = getDb();
  const currentSubscriber = await findSubscriberForEmailManagement(claims);

  if (currentSubscriber?.status === "confirmed") {
    return { success: true };
  }

  const confirmationToken = nanoid(32);
  const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const turnstileResult = await verifyTurnstileToken({
    token: formData.get(TURNSTILE_RESPONSE_FIELD),
    ip,
    action: "resubscribe",
  });

  if (!turnstileResult.success) {
    return { success: false, error: turnstileResult.error };
  }

  try {
    if (
      currentSubscriber &&
      currentSubscriber.status === "pending_confirmation"
    ) {
      const nextFirstName = currentSubscriber.first_name || firstName;
      const nextLastName = currentSubscriber.last_name || lastName;

      if (
        nextFirstName !== currentSubscriber.first_name ||
        nextLastName !== currentSubscriber.last_name
      ) {
        await sql`
          UPDATE subscribers
          SET first_name = ${nextFirstName},
              last_name = ${nextLastName},
              updated_at = NOW()
          WHERE id = ${currentSubscriber.id}
        `;
      }

      if (currentSubscriber.status === "pending_confirmation") {
        await sql`
          UPDATE subscribers
          SET confirmation_token = ${confirmationToken},
              confirmation_token_expires_at = ${tokenExpiry.toISOString()},
              updated_at = NOW()
          WHERE id = ${currentSubscriber.id}
        `;

        await sendConfirmationEmail({
          to: email,
          firstName: nextFirstName,
          confirmationToken,
        });
      }

      return { success: true };
    }

    const id = nanoid();

    await sql`
      INSERT INTO subscribers (id, email, first_name, last_name, status, confirmation_token, confirmation_token_expires_at, tos_accepted_at)
      VALUES (${id}, ${email}, ${firstName}, ${lastName}, 'pending_confirmation', ${confirmationToken}, ${tokenExpiry.toISOString()}, ${new Date().toISOString()})
    `;

    await logAudit({
      action: "subscriber.resubscribed",
      entityType: "subscriber",
      entityId: id,
      metadata: { email, previousSubscriberId: claims.subscriberId },
    });

    await sendConfirmationEmail({
      to: email,
      firstName,
      confirmationToken,
    });

    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
