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
        <h1 className="mb-6 font-bold text-3xl leading-tight text-foreground sm:text-[40px]">
          Welcome back!
        </h1>
        <p className="mb-6 text-base leading-relaxed text-muted">
          You&apos;re back on the waitlist. Marketing emails are off by default
          — you can change this anytime.
        </p>
        <Link
          href={`/email-preferences?email=${encodeURIComponent(email || "")}`}
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
        Enter your email to rejoin the waitlist. Note that you will be placed at
        the back of the queue.
      </p>
      {state?.error && (
        <p className="mb-4 text-sm text-danger">{state.error}</p>
      )}
      <label className="mb-5 flex flex-col gap-1.5">
        <span className="text-sm leading-5 text-foreground/70">Email</span>
        <input
          type="email"
          name="email"
          defaultValue={email}
          required
          className="h-10 w-full max-w-md rounded-md bg-surface px-4 font-sans text-sm text-foreground outline-none placeholder:text-foreground/40 focus:ring-2 focus:ring-foreground/20"
          placeholder="your@email.com"
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-foreground px-6 py-2.5 font-medium text-base text-text-light transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Processing..." : "Resubscribe"}
      </button>
    </form>
  );
}
