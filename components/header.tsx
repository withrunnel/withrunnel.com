import Link from "next/link";
import { LogoFull } from "./logo";

export function Header() {
  return (
    <header className="flex items-center justify-center border-b border-[#C4C4CC] px-8 pt-4 pb-2 lg:px-32">
      <div className="flex w-full max-w-7xl items-center justify-between">
        <Link href="/" className="shrink-0">
          <LogoFull className="h-8 w-auto" fill="#111114" />
        </Link>
        <nav className="hidden items-center gap-8 sm:flex">
          <Link
            href="/pricing"
            className="font-sans text-sm leading-5 text-[#111114]"
          >
            Pricing
          </Link>
        </nav>
        <Link
          href="/join"
          className="rounded-sm bg-[#111114] px-3 py-1.5 font-sans text-sm leading-5 text-[#F4F4F2] transition-opacity hover:opacity-90"
        >
          Join waitlist
        </Link>
      </div>
    </header>
  );
}
