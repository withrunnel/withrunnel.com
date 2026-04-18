"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      <label className="flex flex-col gap-2">
        <span className="text-sm leading-5 text-foreground/70">Auth Key</span>
        <input
          type="password"
          name="authKey"
          required
          autoComplete="current-password"
          className="h-9 w-full rounded-lg bg-surface px-4 font-sans text-sm text-foreground outline-none placeholder:text-foreground/40 focus:ring-2 focus:ring-foreground/20"
          placeholder="Enter your auth key"
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-sm bg-foreground px-4 py-2 font-medium text-base leading-6 text-text-light transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Authenticating..." : "Sign in"}
      </button>
    </form>
  );
}
