"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoFull } from "@/components/logo";
import { logoutAction } from "../actions";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/subscribers", label: "Subscribers" },
  { href: "/admin/emails", label: "Emails" },
  { href: "/admin/audit-log", label: "Audit Log" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-background">
      <div className="border-b border-border px-6 py-4">
        <Link href="/admin/dashboard">
          <LogoFull className="h-6 w-auto" fill="#111114" />
        </Link>
        <p className="mt-1 text-xs text-foreground/50">Admin</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-foreground text-text-light"
                  : "text-foreground hover:bg-surface"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full rounded-md px-3 py-2 text-left text-sm text-foreground/70 transition-colors hover:bg-surface hover:text-foreground"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
