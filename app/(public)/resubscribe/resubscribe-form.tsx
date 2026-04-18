"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resubscribeAction } from "./actions";

export function ResubscribeForm({ email }: { email?: string }) {
  const [state, formAction, isPending] = useActionState(
    resubscribeAction,
    null,
  );

  if (state?.success) {
    return (
      <div>
        <h1 className="mb-6 font-bold text-[40px] leading-[56px] text-foreground">
          Resubscribe
        </h1>
        <p className="mb-6 text-base leading-6 text-foreground">
          You are on the waitlist again now. You are not subscribed to marketing
          emails by default.
        </p>
        <p className="mb-2 text-base text-foreground">Changed your mind?</p>
        <Link
          href={`/email-preferences?email=${encodeURIComponent(email || "")}`}
          className="inline-block rounded-sm bg-foreground px-4 py-2 font-medium text-base leading-6 text-text-light transition-opacity hover:opacity-90"
        >
          Unsubscribe or manage your email preferences
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <h1 className="mb-6 font-bold text-[40px] leading-[56px] text-foreground">
        Resubscribe
      </h1>
      <p className="mb-6 text-base leading-6 text-foreground">
        Enter your email to rejoin the waitlist. Note that you will be placed at
        the back of the queue.
      </p>
      {state?.error && (
        <p className="mb-4 text-sm text-red-700">{state.error}</p>
      )}
      <label className="mb-4 flex flex-col gap-2">
        <span className="text-sm leading-5 text-foreground/70">Email</span>
        <input
          type="email"
          name="email"
          defaultValue={email}
          required
          className="h-9 w-full max-w-md rounded-lg bg-surface px-4 font-sans text-sm text-foreground outline-none placeholder:text-foreground/40 focus:ring-2 focus:ring-foreground/20"
          placeholder="your@email.com"
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-sm bg-foreground px-4 py-2 pr-8 font-medium text-base leading-6 text-text-light transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Processing..." : "Resubscribe"}
      </button>
    </form>
  );
}
