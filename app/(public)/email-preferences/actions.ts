"use server";

import { getDb } from "@/lib/db";
import {
  findSubscriberForEmailManagement,
  verifyEmailManagementToken,
} from "@/lib/email-management";

type PrefsState = {
  success: boolean;
  error?: string;
  newValue?: boolean;
} | null;

export async function toggleMarketingAction(
  _prev: PrefsState,
  formData: FormData,
): Promise<PrefsState> {
  const token = formData.get("token");
  if (typeof token !== "string" || !token) {
    return { success: false, error: "Missing preferences token." };
  }

  const claims = await verifyEmailManagementToken(token);
  if (!claims) {
    return {
      success: false,
      error: "This preferences link is invalid or has expired.",
    };
  }

  const sql = getDb();
  const subscriber = await findSubscriberForEmailManagement(claims);

  if (!subscriber) {
    return { success: false, error: "Subscription not found." };
  }

  if (subscriber.status === "unsubscribed") {
    return {
      success: false,
      error: "You are no longer on the waitlist. Resubscribe to update this.",
    };
  }

  const newValue = !subscriber.marketing_emails;

  try {
    const result = await sql`
      UPDATE subscribers
      SET marketing_emails = ${newValue}, updated_at = NOW()
      WHERE id = ${subscriber.id}
      RETURNING id
    `;

    if (result.length === 0) {
      return { success: false, error: "Subscription not found." };
    }

    return { success: true, newValue };
  } catch {
    return { success: false, error: "Something went wrong." };
  }
}
