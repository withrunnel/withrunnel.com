import type { Metadata } from "next";
import { InfoBox } from "@/components/info-box";
import { logAudit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";
import { ResendButton } from "./resend-button";

export const metadata: Metadata = {
  title: "Confirm Your Email — Runnel",
};

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <section className="mx-auto max-w-2xl px-8 pt-20 pb-24">
        <h1 className="mb-4 font-bold text-3xl leading-tight text-foreground sm:text-[40px]">
          Only one step left
        </h1>
        <p className="mb-6 text-base leading-relaxed text-muted">
          Click the confirmation link in your email to complete your signup.
        </p>
        <InfoBox>
          <p>
            No confirmation token provided. Please check your email for the
            confirmation link.
          </p>
        </InfoBox>
      </section>
    );
  }

  const sql = getDb();
  const rows = await sql`
    SELECT id, email, first_name, status, confirmation_token_expires_at
    FROM subscribers
    WHERE confirmation_token = ${token}
  `;

  if (rows.length === 0) {
    return (
      <section className="mx-auto max-w-2xl px-8 pt-20 pb-24">
        <h1 className="mb-4 font-bold text-3xl leading-tight text-foreground sm:text-[40px]">
          Invalid link
        </h1>
        <InfoBox>
          <p>This confirmation link is invalid or has already been used.</p>
        </InfoBox>
      </section>
    );
  }

  const subscriber = rows[0];

  if (
    subscriber.confirmation_token_expires_at &&
    new Date(subscriber.confirmation_token_expires_at) < new Date()
  ) {
    return (
      <section className="mx-auto max-w-2xl px-8 pt-20 pb-24">
        <h1 className="mb-4 font-bold text-3xl leading-tight text-foreground sm:text-[40px]">
          Link expired
        </h1>
        <InfoBox>
          <p>
            This confirmation link has expired.{" "}
            <ResendButton email={subscriber.email} />
          </p>
        </InfoBox>
      </section>
    );
  }

  if (subscriber.status === "confirmed") {
    return (
      <section className="mx-auto max-w-2xl px-8 pt-20 pb-24">
        <h1 className="mb-4 font-bold text-3xl leading-tight text-foreground sm:text-[40px]">
          You&apos;re in!
        </h1>
        <InfoBox>
          <p>
            You&apos;re on the list! We&apos;ll notify you as soon as a spot
            opens up.
          </p>
        </InfoBox>
      </section>
    );
  }

  await sql`
    UPDATE subscribers
    SET status = 'confirmed',
        confirmed_at = NOW(),
        confirmation_token = NULL,
        confirmation_token_expires_at = NULL,
        updated_at = NOW()
    WHERE id = ${subscriber.id}
  `;

  await logAudit({
    action: "subscriber.confirmed",
    entityType: "subscriber",
    entityId: subscriber.id,
    metadata: { email: subscriber.email },
  });

  try {
    await sendWelcomeEmail({
      to: subscriber.email,
      firstName: subscriber.first_name,
    });
  } catch (e) {
    console.error("Failed to send welcome email:", e);
  }

  return (
    <section className="mx-auto max-w-2xl px-8 pt-20 pb-24">
      <h1 className="mb-4 font-bold text-3xl leading-tight text-foreground sm:text-[40px]">
        You&apos;re in!
      </h1>
      <InfoBox>
        <p>
          You&apos;re on the list! We&apos;ll notify you as soon as a spot opens
          up.
        </p>
        <p className="mt-1.5">
          A welcome email is on its way.{" "}
          <ResendButton email={subscriber.email} />
        </p>
      </InfoBox>
    </section>
  );
}
