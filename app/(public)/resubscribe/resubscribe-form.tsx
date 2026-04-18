"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { resubscribeAction } from "./actions";

export function ResubscribeForm({
  token,
  email,
  turnstileSiteKey,
}: {
  token: string;
  email: string;
  turnstileSiteKey: string | null;
}) {
  const [state, formAction, isPending] = useActionState(
    resubscribeAction,
    null,
  );
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
      <div>
        <h1 className="mb-6 font-bold text-3xl leading-tight text-foreground sm:text-[40px]">
          Welcome back!
        </h1>
        <p className="mb-6 text-base leading-relaxed text-muted">
          You&apos;re back on the waitlist. Marketing emails are off by default
          - you can change this anytime.
        </p>
        <Link
          href={`/email-preferences?token=${encodeURIComponent(token)}`}
          className="inline-block rounded-md bg-foreground px-6 py-2.5 font-medium text-base text-text-light transition-opacity hover:opacity-90"
        >
          Manage email preferences
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <h1 className="mb-6 font-bold text-3xl leading-tight text-foreground sm:text-[40px]">
        Resubscribe
      </h1>
      <p className="mb-6 text-base leading-relaxed text-muted">
        Rejoin the waitlist for{" "}
        <strong className="text-foreground">{email}</strong>. Note that you will
        be placed at the back of the queue.
      </p>
      {state?.error && (
        <p className="mb-4 text-sm text-danger">{state.error}</p>
      )}
      <input type="hidden" name="token" value={token} />
      {turnstileEnabled ? (
        <div className="mb-5 flex flex-col gap-2 rounded-lg bg-surface px-4 py-3">
          <p className="font-medium text-sm text-foreground">
            Help us beat the bots
          </p>
          <TurnstileWidget
            action="resubscribe"
            onTokenChange={setTurnstileToken}
            resetNonce={turnstileResetNonce}
            siteKey={turnstileSiteKey}
          />
        </div>
      ) : null}
      <button
        type="submit"
        disabled={isPending || (turnstileEnabled && !turnstileToken)}
        className="rounded-md bg-foreground px-6 py-2.5 font-medium text-base text-text-light transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Processing..." : "Resubscribe"}
      </button>
    </form>
  );
}
