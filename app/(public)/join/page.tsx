import type { Metadata } from "next";
import { TurnstileScript } from "@/components/turnstile-script";
import { HeroShader } from "../hero-shader";
import { JoinForm } from "./join-form";

export const metadata: Metadata = {
  title: "Join the Waitlist - Runnel",
  description: "Get notified when Runnel is available.",
};

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null;
const TURNSTILE_ENABLED = Boolean(TURNSTILE_SITE_KEY);

export default function JoinPage() {
  return (
    <>
      {TURNSTILE_ENABLED ? <TurnstileScript /> : null}
      <section className="px-8 pt-20 pb-16 lg:px-32">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
          <div className="flex flex-col gap-8 lg:w-2/5">
            <HeroShader />
            <h1 className="font-bold text-3xl leading-tight text-foreground sm:text-[40px] sm:leading-[1.2]">
              Get notified when Runnel is available
            </h1>
          </div>
          <div className="flex-1 lg:max-w-lg">
            <JoinForm turnstileSiteKey={TURNSTILE_SITE_KEY} />
          </div>
        </div>
      </section>
    </>
  );
}
