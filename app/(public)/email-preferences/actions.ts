"use server";

import { getDb } from "@/lib/db";
import { sanitizeEmail } from "@/lib/sanitize";

type PrefsState = {
  success: boolean;
  error?: string;
  newValue?: boolean;
} | null;

export async function toggleMarketingAction(
  _prev: PrefsState,
  formData: FormData,
): Promise<PrefsState> {
  const email = sanitizeEmail(formData.get("email") as string);
  const currentValue = formData.get("currentValue") === "true";

  if (!email) return { success: false, error: "Email is required." };

  const sql = getDb();
  const newValue = !currentValue;

  try {
    const result = await sql`
      UPDATE subscribers
      SET marketing_emails = ${newValue}, updated_at = NOW()
      WHERE email = ${email}
      RETURNING id
    `;

    if (result.length === 0) {
      return { success: false, error: "Email not found." };
    }

    return { success: true, newValue };
  } catch {
    return { success: false, error: "Something went wrong." };
  }
}
