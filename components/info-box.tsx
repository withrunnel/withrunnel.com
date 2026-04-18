import type { ReactNode } from "react";

export function InfoBox({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg bg-surface px-4 py-3 text-sm leading-5 text-foreground/70 ${className}`}
    >
      {children}
    </div>
  );
}
