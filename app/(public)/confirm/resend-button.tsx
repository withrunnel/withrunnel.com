"use client";

import { useState } from "react";

export function ResendButton({ email }: { email: string }) {
  const [sent, setSent] = useState(false);

  return (
    <button
      type="button"
      className="underline disabled:opacity-50"
      disabled={sent}
      onClick={async () => {
        await fetch("/api/resend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        setSent(true);
      }}
    >
      {sent ? "Email sent!" : "Resend"}
    </button>
  );
}
