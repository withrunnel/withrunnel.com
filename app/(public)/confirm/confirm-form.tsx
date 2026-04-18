"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { InfoBox } from "@/components/info-box";
import { ResendEmailForm } from "@/components/resend-email-form";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { type ConfirmActionState, completeConfirmationAction } from "./actions";

export function ConfirmForm({
  email,
  token,
  turnstileSiteKey,
}: {
  email: string;
  token: string;
  turnstileSiteKey: string | null;
}) {
  const [state, formAction, isPending] = useActionState<
    ConfirmActionState,
    FormData
  >(completeConfirmationAction, null);
  const [turnstileResetNonce, setTurnstileResetNonce] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileEnabled = Boolean(turnstileSiteKey);

  useEffect(() => {
    if (state) {
      setTurnstileResetNonce((current) => current + 1);
    }
  }, [state]);

  if (state?.success) {
    return (
      <section className="mx-auto max-w-2xl px-8 pt-20 pb-24">
        <h1 className="mb-4 font-bold text-3xl leading-tight text-foreground sm:text-[40px]">
          You&apos;re in!
        </h1>
        <InfoBox className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <p>
              You&apos;re on the list! We&apos;ll notify you as soon as a spot
              opens up.
            </p>
            <p>A welcome email is on its way.</p>
          </div>
          <ResendEmailForm
            email={state.email || email}
            title="Need it again?"
            description="Click the button below and we’ll resend your welcome email."
            buttonLabel="Resend welcome email"
            successMessage="A fresh welcome email is on the way."
            turnstileSiteKey={turnstileSiteKey}
          />
        </InfoBox>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-8 pt-20 pb-24">
      <h1 className="mb-4 font-bold text-3xl leading-tight text-foreground sm:text-[40px]">
        Only one step left
      </h1>
      <p className="mb-6 text-base leading-relaxed text-muted">
        Verify you&apos;re human, then confirm your email to secure your spot on
        the waitlist.
      </p>
      <form action={formAction} className="flex flex-col gap-5">
        <input type="hidden" name="token" value={token} />
        {state?.error ? (
          <InfoBox>
            <p className="text-sm text-danger">{state.error}</p>
            {state.requiresRejoin ? (
              <Link
                href="/join"
                className="mt-3 inline-block text-sm underline"
              >
                Join the waitlist again
              </Link>
            ) : null}
          </InfoBox>
        ) : null}
        {turnstileEnabled ? (
          <div className="flex flex-col gap-2 rounded-lg bg-surface px-4 py-3">
            <p className="font-medium text-sm text-foreground">
              Help us beat the bots
            </p>
            <TurnstileWidget
              action="confirm-email"
              onTokenChange={setTurnstileToken}
              resetNonce={turnstileResetNonce}
              siteKey={turnstileSiteKey}
            />
          </div>
        ) : null}
        <button
          type="submit"
          disabled={isPending || (turnstileEnabled && !turnstileToken)}
          className="w-fit rounded-md bg-foreground px-6 py-2.5 font-medium text-base text-text-light disabled:opacity-50"
        >
          {isPending ? "Confirming..." : "Confirm my email"}
        </button>
      </form>
    </section>
  );
}
