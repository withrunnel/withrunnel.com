"use client";

import { useActionState } from "react";
import { toggleMarketingAction } from "./actions";

export function EmailPreferencesForm({
  email,
  isSubscribed,
}: {
  email: string;
  isSubscribed: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    toggleMarketingAction,
    null,
  );
  const currentState = state?.newValue ?? isSubscribed;

  return (
    <form action={formAction}>
      <input type="hidden" name="email" value={email} />
      <input
        type="hidden"
        name="currentValue"
        value={currentState ? "true" : "false"}
      />
      {state?.error && (
        <p className="mb-4 text-sm text-red-700">{state.error}</p>
      )}
      {state?.success && (
        <p className="mb-4 text-sm text-green-700">
          Preferences updated successfully.
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-sm bg-foreground px-4 py-2 font-medium text-base leading-6 text-text-light transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Updating..." : currentState ? "Unsubscribe" : "Subscribe"}
      </button>
    </form>
  );
}
