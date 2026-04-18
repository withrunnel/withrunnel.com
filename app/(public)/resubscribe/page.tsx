import type { Metadata } from "next";
import { ResubscribeForm } from "./resubscribe-form";

export const metadata: Metadata = {
  title: "Resubscribe — Runnel",
};

export default async function ResubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <section className="mx-auto max-w-2xl px-8 pt-20 pb-24">
      <ResubscribeForm email={email} />
    </section>
  );
}
