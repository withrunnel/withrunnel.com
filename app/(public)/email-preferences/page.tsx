import type { Metadata } from "next";
import Link from "next/link";
import { InfoBox } from "@/components/info-box";
import {
  findSubscriberForEmailManagement,
  verifyEmailManagementToken,
} from "@/lib/email-management";
import { EmailPreferencesForm } from "./preferences-form";

export const metadata: Metadata = {
  title: "Manage Email Preferences — Runnel",
};

export default async function EmailPreferencesPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <section className="mx-auto max-w-2xl px-8 pt-20 pb-24">
        <h1 className="mb-4 font-bold text-3xl leading-tight text-foreground sm:text-[40px]">
          Email preferences
        </h1>
        <InfoBox>
          <p>No preferences token provided.</p>
        </InfoBox>
      </section>
    );
  }

  const claims = await verifyEmailManagementToken(token);

  if (!claims) {
    return (
      <section className="mx-auto max-w-2xl px-8 pt-20 pb-24">
        <h1 className="mb-4 font-bold text-3xl leading-tight text-foreground sm:text-[40px]">
          Email preferences
        </h1>
        <InfoBox>
          <p>This preferences link is invalid or has expired.</p>
        </InfoBox>
      </section>
    );
  }

  const subscriber = await findSubscriberForEmailManagement(claims);

  if (!subscriber) {
    return (
      <section className="mx-auto max-w-2xl px-8 pt-20 pb-24">
        <h1 className="mb-4 font-bold text-3xl leading-tight text-foreground sm:text-[40px]">
          Email preferences
        </h1>
        <InfoBox>
          <p>This preferences link is no longer active.</p>
        </InfoBox>
      </section>
    );
  }

  if (subscriber.status === "unsubscribed") {
    return (
      <section className="mx-auto max-w-2xl px-8 pt-20 pb-24">
        <h1 className="mb-6 font-bold text-3xl leading-tight text-foreground sm:text-[40px]">
          Email preferences
        </h1>
        <InfoBox>
          <p>
            You&apos;re no longer on the waitlist, so there are no marketing
            preferences to update.
          </p>
          <p className="mt-2">
            If you want to join again, go to{" "}
            <Link
              href={`/resubscribe?token=${encodeURIComponent(token)}`}
              className="underline"
            >
              resubscribe
            </Link>
            .
          </p>
        </InfoBox>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-8 pt-20 pb-24">
      <h1 className="mb-6 font-bold text-3xl leading-tight text-foreground sm:text-[40px]">
        Email preferences
      </h1>
      <EmailPreferencesForm
        token={token}
        isSubscribed={subscriber.marketing_emails}
      />
      <InfoBox className="mt-6">
        <p>
          This only controls marketing emails. To unsubscribe from the waitlist
          entirely, go to{" "}
          <Link
            href={`/unsubscribe?token=${encodeURIComponent(token)}`}
            className="underline"
          >
            unsubscribe
          </Link>
          .
        </p>
      </InfoBox>
    </section>
  );
}
