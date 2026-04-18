const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
export const TURNSTILE_SCRIPT_ID = "cf-turnstile-script";
export const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

const DEFAULT_ERROR_MESSAGE = "Please complete the challenge and try again.";

type TurnstileVerifyResponse = {
  success: boolean;
  action?: string;
  hostname?: string;
  "error-codes"?: string[];
};

export const TURNSTILE_RESPONSE_FIELD = "cf-turnstile-response";

export function getTurnstileCspNonce(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const match = value.match(/'nonce-([^']+)'/);
  return match?.[1] ?? null;
}

export function isTurnstileConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY &&
      process.env.TURNSTILE_SECRET_KEY,
  );
}

function getExpectedHostname(): string | null {
  try {
    return new URL(process.env.NEXT_PUBLIC_BASE_URL || "").hostname;
  } catch {
    return null;
  }
}

function mapTurnstileError(errorCodes: string[] | undefined): string {
  if (!errorCodes || errorCodes.length === 0) {
    return DEFAULT_ERROR_MESSAGE;
  }

  if (
    errorCodes.includes("missing-input-response") ||
    errorCodes.includes("invalid-input-response")
  ) {
    return "Please complete the verification.";
  }

  if (errorCodes.includes("timeout-or-duplicate")) {
    return "Your verification expired. Please complete it again.";
  }

  return DEFAULT_ERROR_MESSAGE;
}

export async function verifyTurnstileToken(params: {
  token: FormDataEntryValue | string | null;
  ip?: string;
  action: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  const normalizedToken =
    typeof params.token === "string" ? params.token.trim() : "";

  if (!normalizedToken) {
    return {
      success: false,
      error: "Please complete the verification.",
    };
  }

  if (!isTurnstileConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      return { success: true };
    }

    return {
      success: false,
      error: "Human verification is not configured.",
    };
  }

  try {
    const formData = new FormData();
    formData.append("secret", process.env.TURNSTILE_SECRET_KEY!);
    formData.append("response", normalizedToken);

    if (params.ip && params.ip !== "unknown") {
      formData.append("remoteip", params.ip);
    }

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body: formData,
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        success: false,
        error: DEFAULT_ERROR_MESSAGE,
      };
    }

    const payload = (await response.json()) as TurnstileVerifyResponse;

    if (!payload.success) {
      return {
        success: false,
        error: mapTurnstileError(payload["error-codes"]),
      };
    }

    if (payload.action !== params.action) {
      return {
        success: false,
        error: DEFAULT_ERROR_MESSAGE,
      };
    }

    const expectedHostname = getExpectedHostname();
    if (
      process.env.NODE_ENV === "production" &&
      expectedHostname &&
      payload.hostname &&
      payload.hostname !== expectedHostname
    ) {
      return {
        success: false,
        error: DEFAULT_ERROR_MESSAGE,
      };
    }

    return { success: true };
  } catch {
    return {
      success: false,
      error: DEFAULT_ERROR_MESSAGE,
    };
  }
}
