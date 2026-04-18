"use server";

import { nanoid } from "nanoid";
import { logAudit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import { sendConfirmationEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeEmail } from "@/lib/sanitize";

type ResubState = { success: boolean; error?: string } | null;

export async function resubscribeAction(
  _prev: ResubState,
  formData: FormData,
): Promise<ResubState> {
  const email = sanitizeEmail(formData.get("email") as string);
  if (!email) return { success: false, error: "Email is required." };

  const rl = rateLimit(`resub:${email}`, 3, 15 * 60 * 1000);
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
    await sql`
      INSERT INTO subscribers (id, email, first_name, last_name, status, confirmation_token, confirmation_token_expires_at, tos_accepted_at)
      VALUES (${id}, ${email}, '', '', 'pending_confirmation', ${confirmationToken}, ${tokenExpiry.toISOString()}, ${new Date().toISOString()})
    `;

    await logAudit({
      action: "subscriber.resubscribed",
      entityType: "subscriber",
      entityId: id,
      metadata: { email },
    });

    await sendConfirmationEmail({
      to: email,
      firstName: "",
      confirmationToken,
    });

    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
