"use client";

import { useActionState } from "react";
import { toggleMarketingAction } from "./actions";

export function EmailPreferencesForm({
  token,
  isSubscribed,
}: {
  token: string;
  isSubscribed: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    toggleMarketingAction,
    null,
  );
  const currentState = state?.newValue ?? isSubscribed;

  return (
    <form action={formAction}>
      <p className="mb-6 text-base leading-relaxed text-muted">
        You are currently{" "}
        <strong className="text-foreground">
          {currentState ? "subscribed to" : "not subscribed to"}
        </strong>{" "}
        marketing emails. Use the button below to change this.
      </p>
      <input type="hidden" name="token" value={token} />
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
