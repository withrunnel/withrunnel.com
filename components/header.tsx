import Link from "next/link";
import { LogoFull } from "./logo";

export function Header() {
  return (
    <header className="flex items-center justify-center border-b border-border px-6 py-3 lg:px-32">
      <div className="flex w-full max-w-7xl items-center justify-between">
        <Link href="/" className="shrink-0">
          <LogoFull className="h-8 w-auto" fill="#111114" />
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/join"
            className="rounded-sm bg-foreground px-3 py-1.5 font-sans text-sm leading-5 text-text-light transition-opacity hover:opacity-90"
          >
            Join waitlist
          </Link>
        </nav>
      </div>
    </header>
  );
}
