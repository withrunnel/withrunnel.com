import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/admin-auth";
import { AdminLoginForm } from "./login-form";

export default async function AdminPage() {
  const isAuthenticated = await verifyAdminSession();
  if (isAuthenticated) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-8">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 font-bold text-3xl text-foreground">Admin</h1>
        <p className="mb-8 text-sm text-foreground/70">
          Enter your auth key to continue.
        </p>
        <AdminLoginForm />
      </div>
    </div>
  );
}
