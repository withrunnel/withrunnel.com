"use server";

import { redirect } from "next/navigation";
import {
  createAdminSession,
  destroyAdminSession,
  validateAuthKey,
} from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";

type LoginState = { error?: string } | null;

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const authKey = formData.get("authKey") as string;

  const rl = rateLimit("admin:login", 5, 15 * 60 * 1000);
  if (!rl.success) {
    return { error: "Too many attempts. Please try again later." };
  }

  if (!validateAuthKey(authKey)) {
    return { error: "Invalid auth key." };
  }

  await createAdminSession();

  await logAudit({
    action: "admin.login",
    entityType: "admin",
    actor: "admin",
  });

  redirect("/admin/dashboard");
}

export async function logoutAction() {
  await logAudit({
    action: "admin.logout",
    entityType: "admin",
    actor: "admin",
  });
  await destroyAdminSession();
  redirect("/admin");
}
