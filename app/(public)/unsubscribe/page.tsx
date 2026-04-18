import type { Metadata } from "next";
import Link from "next/link";
import { InfoBox } from "@/components/info-box";
import { UnsubscribeForm } from "./unsubscribe-form";

export const metadata: Metadata = {
  title: "Unsubscribe — Runnel",
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  if (!email) {
    return (
      <section className="mx-auto max-w-2xl px-8 pt-20 pb-24">
        <h1 className="mb-4 font-bold text-3xl leading-tight text-foreground sm:text-[40px]">
          Unsubscribe
        </h1>
        <InfoBox>
          <p>No email address provided.</p>
        </InfoBox>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-8 pt-20 pb-24">
      <h1 className="mb-6 font-bold text-3xl leading-tight text-foreground sm:text-[40px]">
        Unsubscribe
      </h1>
      <div className="mb-6 text-base leading-relaxed text-muted">
        <p>To unsubscribe from the Runnel waitlist, click the button below.</p>
        <p className="mt-2">
          Please note that unsubscribing will remove you from the waitlist. Even
          if you resubscribe later, you will be placed at the back of the queue.
        </p>
      </div>
      <UnsubscribeForm email={email} />
      <InfoBox className="mt-6">
        <p>
          This will permanently delete or anonymize your email address and all
          personal data from our records.
        </p>
      </InfoBox>
      <InfoBox className="mt-4">
        <p>
          Want to manage marketing email preferences instead?{" "}
          <Link
            href={`/email-preferences?email=${encodeURIComponent(email)}`}
            className="underline"
          >
            Manage preferences
          </Link>
        </p>
      </InfoBox>
    </section>
  );
}
