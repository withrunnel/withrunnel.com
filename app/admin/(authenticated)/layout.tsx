import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { verifyAdminSession } from "@/lib/admin-auth";
import { AdminSidebar } from "./sidebar";

export default async function AuthenticatedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const isAuthenticated = await verifyAdminSession();
  if (!isAuthenticated) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
