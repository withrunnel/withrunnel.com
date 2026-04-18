"use server";

import { nanoid } from "nanoid";
import { z } from "zod/v4";
import { logAudit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import { sendConfirmationEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeEmail, sanitizeInput } from "@/lib/sanitize";

const joinSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.email(),
  referralSource: z.string().max(500).optional(),
  tosAccepted: z.literal("on"),
  marketingEmails: z.string().optional(),
});

type JoinState = {
  success: boolean;
  error?: string;
  email?: string;
} | null;

export async function joinWaitlist(
  _prev: JoinState,
  formData: FormData,
): Promise<JoinState> {
  const raw = Object.fromEntries(formData.entries());

  const parsed = joinSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error:
        "Please fill in all required fields and accept the Terms of Service.",
    };
  }

  const { firstName, lastName, email, referralSource, marketingEmails } =
    parsed.data;

  const sanitizedEmail = sanitizeEmail(email);

  const rl = rateLimit(`join:${sanitizedEmail}`, 3, 15 * 60 * 1000);
  if (!rl.success) {
    return {
      success: false,
      error: "Too many attempts. Please try again later.",
    };
  }

  const sql = getDb();
  const id = nanoid();
  const confirmationToken = nanoid(32);
  const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  try {
    const existing =
      await sql`SELECT id, status FROM subscribers WHERE email = ${sanitizedEmail}`;

    if (existing.length > 0) {
      const sub = existing[0];
      if (sub.status === "confirmed") {
        return {
          success: false,
          error: "This email is already on the waitlist.",
        };
      }
      if (sub.status === "pending_confirmation") {
        await sql`
          UPDATE subscribers
          SET confirmation_token = ${confirmationToken},
              confirmation_token_expires_at = ${tokenExpiry.toISOString()},
              first_name = ${sanitizeInput(firstName)},
              last_name = ${sanitizeInput(lastName)},
              updated_at = NOW()
          WHERE id = ${sub.id}
        `;
        await sendConfirmationEmail({
          to: sanitizedEmail,
          firstName: sanitizeInput(firstName),
          confirmationToken,
        });
        return { success: true, email: sanitizedEmail };
      }
    }

    await sql`
      INSERT INTO subscribers (id, email, first_name, last_name, referral_source, marketing_emails, confirmation_token, confirmation_token_expires_at, tos_accepted_at)
      VALUES (
        ${id},
        ${sanitizedEmail},
        ${sanitizeInput(firstName)},
        ${sanitizeInput(lastName)},
        ${sanitizeInput(referralSource || "")},
        ${marketingEmails === "on"},
        ${confirmationToken},
        ${tokenExpiry.toISOString()},
        ${new Date().toISOString()}
      )
    `;

    await logAudit({
      action: "subscriber.joined",
      entityType: "subscriber",
      entityId: id,
      metadata: { email: sanitizedEmail },
    });

    await sendConfirmationEmail({
      to: sanitizedEmail,
      firstName: sanitizeInput(firstName),
      confirmationToken,
    });

    return { success: true, email: sanitizedEmail };
  } catch (error) {
    console.error("Join waitlist error:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
