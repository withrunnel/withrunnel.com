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
      <section className="px-8 pt-16 pb-24 lg:px-32">
        <h1 className="mb-4 font-bold text-[40px] leading-[56px] text-foreground">
          Unsubscribe
        </h1>
        <InfoBox>
          <p>No email address provided.</p>
        </InfoBox>
      </section>
    );
  }

  return (
    <section className="px-8 pt-16 pb-24 lg:px-32">
      <h1 className="mb-6 font-bold text-[40px] leading-[56px] text-foreground">
        Unsubscribe
      </h1>
      <div className="mb-6 max-w-xl text-base leading-6 text-foreground">
        <p>
          To unsubscribe from the Runnel waitlist, please click the button
          below.
        </p>
        <p className="mt-2">
          Please note that unsubscribing will remove you from the waitlist; even
          if you resubscribe immediately, you will be back at the back of the
          queue.
        </p>
      </div>
      <UnsubscribeForm email={email} />
      <InfoBox className="mt-6 max-w-3xl">
        <p>
          This will permanently delete or desensitize your email address and all
          personal data from our (Runnel Waitlist app, available at
          https://withrunnel.com) records.
        </p>
      </InfoBox>
      <InfoBox className="mt-4 max-w-3xl">
        <p>
          If you want to manage your preferences about marketing emails, please{" "}
          <Link
            href={`/email-preferences?email=${encodeURIComponent(email)}`}
            className="underline"
          >
            click here.
          </Link>
        </p>
      </InfoBox>
    </section>
  );
}
