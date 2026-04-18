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
      <section className="px-8 pt-16 pb-24 lg:px-32">
        <h1 className="mb-4 font-bold text-[40px] leading-[56px] text-foreground">
          Manage your email preferences
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
    <section className="px-8 pt-16 pb-24 lg:px-32">
      <h1 className="mb-6 font-bold text-[40px] leading-[56px] text-foreground">
        Manage your email preferences
      </h1>
      <p className="mb-6 max-w-2xl text-base leading-6 text-foreground">
        You are {isSubscribed ? "subscribing" : "not subscribing"} from
        marketing emails now. To {isSubscribed ? "unsubscribe" : "subscribe"} to
        them, use the button below.
      </p>
      <EmailPreferencesForm email={email} isSubscribed={isSubscribed} />
      <InfoBox className="mt-6 max-w-3xl">
        <p>
          This will NOT unsubscribe you from the Waitlist! To unsubscribe from
          the waitlist, please{" "}
          <Link
            href={`/unsubscribe?email=${encodeURIComponent(email)}`}
            className="underline"
          >
            click here.
          </Link>
        </p>
      </InfoBox>
    </section>
  );
}
