"use server";

import { logAudit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import { sanitizeEmail } from "@/lib/sanitize";

type UnsubState = { success: boolean; error?: string } | null;

export async function unsubscribeAction(
  _prev: UnsubState,
  formData: FormData,
): Promise<UnsubState> {
  const email = sanitizeEmail(formData.get("email") as string);
  if (!email) return { success: false, error: "Email is required." };

  const sql = getDb();

  const rows = await sql`
    SELECT id, status FROM subscribers WHERE email = ${email}
  `;

  if (rows.length === 0) {
    return { success: false, error: "Email not found on the waitlist." };
  }

  const subscriber = rows[0];

  if (subscriber.status === "unsubscribed") {
    return { success: true };
  }

  await sql`
    UPDATE subscribers
    SET status = 'unsubscribed',
        unsubscribed_at = NOW(),
        marketing_emails = false,
        email = ${`unsubscribed-${subscriber.id}@redacted.local`},
        first_name = '[redacted]',
        last_name = '[redacted]',
        referral_source = '',
        ip_address = NULL,
        user_agent = NULL,
        updated_at = NOW()
    WHERE id = ${subscriber.id}
  `;

  await logAudit({
    action: "subscriber.unsubscribed",
    entityType: "subscriber",
    entityId: subscriber.id,
    metadata: {},
  });

  return { success: true };
}
