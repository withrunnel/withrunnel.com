"use client";

import Link from "next/link";
import { useActionState } from "react";
import { unsubscribeAction } from "./actions";

export function UnsubscribeForm({ email }: { email: string }) {
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
          href={`/resubscribe?email=${encodeURIComponent(email)}`}
          className="inline-block rounded-md bg-foreground px-6 py-2.5 font-medium text-base text-text-light transition-opacity hover:opacity-90"
        >
          Resubscribe
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="email" value={email} />
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
  );
}
