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
        <h2 className="mb-4 font-bold text-[40px] leading-[56px] text-foreground">
          Unsubscribe
        </h2>
        <p className="mb-2 text-base leading-6 text-foreground">
          You have successfully unsubscribed from the Runnel Waitlist, you will
          no longer receive emails from the Waitlist.
        </p>
        <p className="mb-6 text-base leading-6 text-foreground">
          If you have subscribed to marketing emails when sign up, you are also
          being removed from the list.
        </p>
        <p className="mb-2 text-base text-foreground">Changed your mind?</p>
        <Link
          href={`/resubscribe?email=${encodeURIComponent(email)}`}
          className="inline-block rounded-sm bg-foreground px-4 py-2 pr-8 font-medium text-base leading-6 text-text-light transition-opacity hover:opacity-90"
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
        <p className="mb-4 text-sm text-red-700">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-sm bg-foreground px-4 py-2 pr-8 font-medium text-base leading-6 text-text-light transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Processing..." : "Confirm"}
      </button>
    </form>
  );
}
