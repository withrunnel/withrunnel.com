"use server";

import { logAudit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import {
  findSubscriberForEmailManagement,
  verifyEmailManagementToken,
} from "@/lib/email-management";

type UnsubState = { success: boolean; error?: string } | null;

export async function unsubscribeAction(
  _prev: UnsubState,
  formData: FormData,
): Promise<UnsubState> {
  const token = formData.get("token");
  if (typeof token !== "string" || !token) {
    return { success: false, error: "Missing unsubscribe token." };
  }

  const claims = await verifyEmailManagementToken(token);
  if (!claims) {
    return {
      success: false,
      error: "This unsubscribe link is invalid or has expired.",
    };
  }

  const sql = getDb();
  const subscriber = await findSubscriberForEmailManagement(claims);
  if (!subscriber) {
    return { success: false, error: "Subscription not found." };
  }

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
    metadata: { email: claims.email },
  });

  return { success: true };
}
