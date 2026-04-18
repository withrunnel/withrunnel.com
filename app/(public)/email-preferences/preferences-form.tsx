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
        <p className="mb-4 text-sm text-danger">{state.error}</p>
      )}
      {state?.success && (
        <p className="mb-4 text-sm text-success">
          Preferences updated successfully.
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-foreground px-6 py-2.5 font-medium text-base text-text-light transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending
          ? "Updating..."
          : currentState
            ? "Unsubscribe from marketing"
            : "Subscribe to marketing"}
      </button>
    </form>
  );
}
