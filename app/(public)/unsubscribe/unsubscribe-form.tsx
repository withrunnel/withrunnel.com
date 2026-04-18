"use client";

import Link from "next/link";
import { useActionState } from "react";
import { InfoBox } from "@/components/info-box";
import { unsubscribeAction } from "./actions";

export function UnsubscribeForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(
    unsubscribeAction,
    null,
  );

  if (state?.success) {
    return (
      <div>
        <p className="mb-2 text-base leading-relaxed text-foreground">
          You have been unsubscribed from the Runnel waitlist. You will no
          longer receive any emails from us.
        </p>
        <p className="mb-6 text-base leading-relaxed text-muted">
          If you had opted into marketing emails, you have been removed from
          that list as well.
        </p>
        <p className="mb-3 text-sm text-muted">Changed your mind?</p>
        <Link
          href={`/resubscribe?token=${encodeURIComponent(token)}`}
          className="inline-block rounded-md bg-foreground px-6 py-2.5 font-medium text-base text-text-light transition-opacity hover:opacity-90"
        >
          Resubscribe
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 text-base leading-relaxed text-muted">
        <p>To unsubscribe from the Runnel waitlist, click the button below.</p>
        <p className="mt-2">
          Please note that unsubscribing will remove you from the waitlist. Even
          if you resubscribe later, you will be placed at the back of the queue.
        </p>
      </div>
      <form action={formAction}>
        <input type="hidden" name="token" value={token} />
        {state?.error && (
          <p className="mb-4 text-sm text-danger">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-foreground px-6 py-2.5 font-medium text-base text-text-light transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Processing..." : "Confirm unsubscribe"}
        </button>
      </form>
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
            href={`/email-preferences?token=${encodeURIComponent(token)}`}
            className="underline"
          >
            Manage preferences
          </Link>
        </p>
      </InfoBox>
    </>
  );
}
