import Link from "next/link";
import { LogoFull } from "./logo";

export function Footer() {
  return (
    <footer className="mt-auto flex flex-col gap-16 bg-surface-dark px-8 py-16 lg:gap-32 lg:px-18">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="flex flex-col gap-5 lg:w-1/2">
          <LogoFull className="h-12 w-auto lg:h-16" fill="#F4F4F2" />
          <p className="font-light text-base leading-5 text-text-light/70">
            &copy; 2026 Runnel, all rights reserved.
          </p>
        </div>
        <div className="flex flex-1 justify-end">
          <div className="flex gap-16">
            <div className="flex flex-col items-end gap-2">
              <span className="font-semibold text-base leading-5 text-text-light">
                Social
              </span>
              <Link
                href="https://x.com/runnel"
                className="text-base leading-5 text-text-light transition-opacity hover:opacity-80"
              >
                X
              </Link>
              <Link
                href="https://discord.gg/runnel"
                className="text-base leading-5 text-text-light transition-opacity hover:opacity-80"
              >
                Discord
              </Link>
              <Link
                href="https://github.com/runnel"
                className="text-base leading-5 text-text-light transition-opacity hover:opacity-80"
              >
                GitHub
              </Link>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="font-semibold text-base leading-5 text-text-light">
                Legal
              </span>
              <Link
                href="/legal/terms"
                className="text-base leading-5 text-text-light transition-opacity hover:opacity-80"
              >
                Terms of Service
              </Link>
              <Link
                href="/legal/privacy"
                className="text-base leading-5 text-text-light transition-opacity hover:opacity-80"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center overflow-hidden mix-blend-exclusion">
        <LogoFull className="w-full max-w-[1130px] opacity-90" fill="#F4F4F2" />
      </div>
    </footer>
  );
}
