import type { Metadata } from "next";
import { HeroShader } from "../hero-shader";
import { JoinForm } from "./join-form";

export const metadata: Metadata = {
  title: "Join the Waitlist — Runnel",
  description: "Get notified when Runnel is available.",
};

export default function JoinPage() {
  return (
    <section className="px-8 pt-16 lg:px-32">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="flex flex-col gap-8 lg:w-2/5">
          <HeroShader />
          <h1 className="font-bold text-[40px] leading-[56px] text-foreground">
            Get notified when Runnel is available
          </h1>
        </div>
        <div className="flex-1 lg:pr-32">
          <JoinForm />
        </div>
      </div>
    </section>
  );
}
