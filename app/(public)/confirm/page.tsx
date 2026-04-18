import type { Metadata } from "next";
import type { ReactNode } from "react";
import { InfoBox } from "@/components/info-box";
import { ResendEmailForm } from "@/components/resend-email-form";
import { TurnstileScript } from "@/components/turnstile-script";
import { getDb } from "@/lib/db";
import { ConfirmForm } from "./confirm-form";

export const metadata: Metadata = {
  title: "Confirm Your Email - Runnel",
};

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null;
const TURNSTILE_ENABLED = Boolean(TURNSTILE_SITE_KEY);

function renderWithTurnstile(content: ReactNode) {
  return (
    <>
      {TURNSTILE_ENABLED ? <TurnstileScript /> : null}
      {content}
    </>
  );
}

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return renderWithTurnstile(
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
      </section>,
    );
  }

  const sql = getDb();
  const rows = await sql`
    SELECT id, email, first_name, last_name, status, confirmation_token_expires_at
    FROM subscribers
    WHERE confirmation_token = ${token}
  `;

  if (rows.length === 0) {
    return renderWithTurnstile(
      <section className="mx-auto max-w-2xl px-8 pt-20 pb-24">
        <h1 className="mb-4 font-bold text-3xl leading-tight text-foreground sm:text-[40px]">
          Invalid link
        </h1>
        <InfoBox>
          <p>This confirmation link is invalid or has already been used.</p>
        </InfoBox>
      </section>,
    );
  }

  const subscriber = rows[0];

  if (
    subscriber.confirmation_token_expires_at &&
    new Date(subscriber.confirmation_token_expires_at) < new Date()
  ) {
    return renderWithTurnstile(
      <section className="mx-auto max-w-2xl px-8 pt-20 pb-24">
        <h1 className="mb-4 font-bold text-3xl leading-tight text-foreground sm:text-[40px]">
          Link expired
        </h1>
        <InfoBox className="flex flex-col gap-4">
          <p>This confirmation link has expired.</p>
          <ResendEmailForm
            email={subscriber.email}
            title="Need a fresh confirmation email?"
            description="Click the button below and we’ll send another confirmation link."
            buttonLabel="Resend confirmation email"
            successMessage="A new confirmation email is on the way."
            turnstileSiteKey={TURNSTILE_SITE_KEY}
          />
        </InfoBox>
      </section>,
    );
  }

  if (subscriber.status === "confirmed") {
    return renderWithTurnstile(
      <section className="mx-auto max-w-2xl px-8 pt-20 pb-24">
        <h1 className="mb-4 font-bold text-3xl leading-tight text-foreground sm:text-[40px]">
          You&apos;re in!
        </h1>
        <InfoBox className="flex flex-col gap-4">
          <p>
            You&apos;re on the list! We&apos;ll notify you as soon as a spot
            opens up.
          </p>
          <ResendEmailForm
            email={subscriber.email}
            title="Need the welcome email again?"
            description="Click the button below and we’ll resend your welcome email."
            buttonLabel="Resend welcome email"
            successMessage="A fresh welcome email is on the way."
            turnstileSiteKey={TURNSTILE_SITE_KEY}
          />
        </InfoBox>
      </section>,
    );
  }

  return renderWithTurnstile(
    <ConfirmForm
      token={token}
      email={subscriber.email}
      turnstileSiteKey={TURNSTILE_SITE_KEY}
    />,
  );
}
