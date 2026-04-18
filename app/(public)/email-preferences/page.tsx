import type { Metadata } from "next";
import Link from "next/link";
import { InfoBox } from "@/components/info-box";
import { getDb } from "@/lib/db";
import { EmailPreferencesForm } from "./preferences-form";

export const metadata: Metadata = {
  title: "Manage Email Preferences — Runnel",
};

export default async function EmailPreferencesPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  if (!email) {
    return (
      <section className="mx-auto max-w-2xl px-8 pt-20 pb-24">
        <h1 className="mb-4 font-bold text-3xl leading-tight text-foreground sm:text-[40px]">
          Email preferences
        </h1>
        <InfoBox>
          <p>No email address provided.</p>
        </InfoBox>
      </section>
    );
  }

  const sql = getDb();
  const rows = await sql`
    SELECT marketing_emails, status FROM subscribers WHERE email = ${email.toLowerCase()}
  `;

  const subscriber = rows[0];
  const isSubscribed = subscriber?.marketing_emails ?? false;

  return (
    <section className="mx-auto max-w-2xl px-8 pt-20 pb-24">
      <h1 className="mb-6 font-bold text-3xl leading-tight text-foreground sm:text-[40px]">
        Email preferences
      </h1>
      <p className="mb-6 text-base leading-relaxed text-muted">
        You are currently{" "}
        <strong className="text-foreground">
          {isSubscribed ? "subscribed to" : "not subscribed to"}
        </strong>{" "}
        marketing emails. Use the button below to change this.
      </p>
      <EmailPreferencesForm email={email} isSubscribed={isSubscribed} />
      <InfoBox className="mt-6">
        <p>
          This only controls marketing emails. To unsubscribe from the waitlist
          entirely, go to{" "}
          <Link
            href={`/unsubscribe?email=${encodeURIComponent(email)}`}
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
