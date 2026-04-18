import type { Metadata } from "next";
import Link from "next/link";
import { HeroShader } from "./hero-shader";

export const metadata: Metadata = {
  title: "Runnel — The Inference Platform Made Easy",
  description:
    "Seamlessly integrate 70+ models all in one place. Runnel is your scalable choice.",
};

const features = [
  {
    title: "Ultra-Low Latency",
    description:
      "Speed is a feature. Global routing finds the fastest path to your model for faster end-user responses.",
  },
  {
    title: "High Throughput",
    description:
      "Built for enterprise scale. Handles everything from daily workloads to massive traffic spikes without slowing down.",
  },
  {
    title: "Cost Optimization",
    description:
      "Stop overpaying for compute. Runnel routes requests to the most cost-efficient provider for better output at lower cost.",
  },
  {
    title: "Frictionless Scalability",
    description:
      "Focus on building your product. Scale from prototype to production without managing complex infrastructure.",
  },
];

const oldWay = [
  "Managing one account for each model provider",
  "Unpredictable monthly cost",
  "Manual fallback logic",
  "Managing multiple endpoints",
  "Overpaying for tokens",
];

const runnelWay = [
  "Only one account across 70+ state-of-art models",
  "All-in-one cost control kit",
  "Built-in auto fallback",
  "Use one single endpoint for all models",
  "Save up to 40% every month",
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="px-8 pt-20 pb-8 lg:px-32">
        <HeroShader />
        <div className="mt-10 flex flex-col gap-6">
          <h1 className="max-w-2xl font-bold text-4xl leading-[1.15] tracking-tight text-foreground sm:text-5xl">
            The inference platform made easy
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
            Seamlessly integrate 70+ models all in one place. Runnel is your
            scalable choice.
          </p>
        </div>
        <div className="mt-8">
          <Link
            href="/join"
            className="inline-block rounded-md bg-foreground px-6 py-2.5 font-medium text-base text-text-light transition-opacity hover:opacity-90"
          >
            Join waitlist
          </Link>
        </div>
      </section>

      {/* Sub-hero */}
      <section className="px-8 py-16 text-center lg:px-32">
        <p className="text-base leading-6 text-muted">
          Built for agents that can&apos;t afford to wait, fail, or overpay.
        </p>
      </section>

      {/* Features Grid */}
      <section className="px-8 lg:px-16">
        <h2 className="mb-10 text-center font-semibold text-3xl leading-tight text-foreground">
          Engineered for Performance and Efficiency
        </h2>
        <div className="border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col items-center justify-center gap-4 border-b border-l border-r border-border px-8 py-10 text-center lg:px-16"
                style={{ minHeight: 240 }}
              >
                <h3 className="font-semibold text-xl leading-7 text-foreground">
                  {feature.title}
                </h3>
                <p className="max-w-sm text-base leading-6 text-muted">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Switch */}
      <section className="px-8 py-24 lg:px-32">
        <h2 className="mb-12 text-center font-semibold text-3xl leading-tight text-foreground">
          Why switch to Runnel
        </h2>
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-0 md:grid-cols-2">
          <div className="flex flex-col items-center gap-4 border border-border px-8 py-10">
            <h3 className="font-semibold text-lg leading-7 text-foreground">
              The Old Way
            </h3>
            <ul className="flex flex-col items-center gap-3">
              {oldWay.map((item) => (
                <li
                  key={item}
                  className="text-center text-sm leading-5 text-muted"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-center gap-4 rounded-r-lg bg-foreground px-8 py-10">
            <h3 className="font-semibold text-lg leading-7 text-text-light">
              The Runnel Way
            </h3>
            <ul className="flex flex-col items-center gap-3">
              {runnelWay.map((item) => (
                <li
                  key={item}
                  className="text-center text-sm leading-5 text-text-light/80"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-8 mb-16 flex flex-col gap-8 rounded-lg bg-foreground p-8 lg:mx-32 lg:flex-row lg:items-center lg:justify-between lg:p-16">
        <div className="flex flex-col gap-4 lg:max-w-md">
          <h2 className="font-bold text-3xl leading-tight text-text-light">
            Your first million tokens are on us.
          </h2>
          <p className="text-base leading-6 text-text-light/70">
            No credit card. No setup fee. Just an API key and whatever
            you&apos;re building.
          </p>
          <Link
            href="/join"
            className="mt-2 w-fit rounded-md border border-text-light/30 px-5 py-2 font-medium text-sm text-text-light transition-colors hover:border-text-light/60"
          >
            Join waitlist
          </Link>
        </div>
        <div className="hidden lg:block">
          <HeroShader variant="small" />
        </div>
      </section>
    </>
  );
}
