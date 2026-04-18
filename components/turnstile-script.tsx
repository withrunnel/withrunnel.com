import { headers } from "next/headers";
import Script from "next/script";
import {
  getTurnstileCspNonce,
  TURNSTILE_SCRIPT_ID,
  TURNSTILE_SCRIPT_SRC,
} from "@/lib/turnstile";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export async function TurnstileScript() {
  if (!TURNSTILE_SITE_KEY) {
    return null;
  }

  const requestHeaders = await headers();
  const nonce =
    requestHeaders.get("x-nonce") ??
    getTurnstileCspNonce(requestHeaders.get("content-security-policy"));

  return (
    <Script
      id={TURNSTILE_SCRIPT_ID}
      src={TURNSTILE_SCRIPT_SRC}
      strategy="afterInteractive"
      nonce={nonce ?? undefined}
    />
  );
}
