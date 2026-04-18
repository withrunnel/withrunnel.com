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
      className={`rounded-lg bg-[#E9E9E7] px-4 py-3 text-sm leading-5 text-[#111114]/70 ${className}`}
    >
      {children}
    </div>
  );
}
