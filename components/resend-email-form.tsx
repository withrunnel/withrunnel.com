"use client";

import { useState } from "react";
import { TurnstileWidget } from "@/components/turnstile-widget";

export function ResendEmailForm({
  buttonLabel = "Resend email",
  className = "",
  description,
  email,
  successMessage = "A fresh email is on the way.",
  title,
  turnstileSiteKey,
}: {
  buttonLabel?: string;
  className?: string;
  description?: string;
  email: string;
  successMessage?: string;
  title?: string;
  turnstileSiteKey: string | null;
}) {
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{
    error?: string;
    success?: boolean;
  } | null>(null);
  const [showTurnstile, setShowTurnstile] = useState(false);
  const [turnstileResetNonce, setTurnstileResetNonce] = useState(0);
  const turnstileEnabled = Boolean(turnstileSiteKey);

  async function sendResendRequest(token: string | null) {
    setIsSending(true);
    setResult(null);

    try {
      const response = await fetch("/api/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          turnstileToken: token,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setResult({ error: payload.error || "Failed to resend email." });
        return;
      }

      setResult({ success: true });
    } catch {
      setResult({ error: "Network error. Please try again." });
    } finally {
      setIsSending(false);
      setShowTurnstile(false);
      setTurnstileResetNonce((current) => current + 1);
    }
  }

  function handleButtonClick() {
    if (turnstileEnabled) {
      setResult(null);
      setShowTurnstile(true);
    } else {
      void sendResendRequest(null);
    }
  }

  function handleTokenChange(token: string | null) {
    if (token) {
      void sendResendRequest(token);
    }
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {title ? (
        <p className="font-medium text-sm text-foreground">{title}</p>
      ) : null}
      {description ? (
        <p className="text-sm leading-5 text-foreground/70">{description}</p>
      ) : null}
      {showTurnstile && turnstileEnabled ? (
        <TurnstileWidget
          action="resend-email"
          inputName={null}
          onTokenChange={handleTokenChange}
          resetNonce={turnstileResetNonce}
          siteKey={turnstileSiteKey}
        />
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={isSending || showTurnstile}
          onClick={handleButtonClick}
          className="rounded-md border border-border bg-background px-3 py-2 font-medium text-sm text-foreground disabled:opacity-50"
        >
          {isSending
            ? "Sending..."
            : showTurnstile
              ? "Verifying..."
              : buttonLabel}
        </button>
        {result?.success ? (
          <p className="text-sm leading-5 text-success">{successMessage}</p>
        ) : null}
      </div>
      {result?.error ? (
        <p className="text-sm leading-5 text-danger">{result.error}</p>
      ) : null}
    </div>
  );
}
