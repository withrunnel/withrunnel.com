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
    <section className="px-8 pt-16 pb-24 lg:px-32">
      <ResubscribeForm email={email} />
    </section>
  );
}
