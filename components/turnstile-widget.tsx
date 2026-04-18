"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  TURNSTILE_RESPONSE_FIELD,
  TURNSTILE_SCRIPT_ID,
  TURNSTILE_SCRIPT_SRC,
} from "@/lib/turnstile";

type TurnstileWidgetId = string | number;

type TurnstileRenderOptions = {
  action: string;
  callback: (token: string) => void;
  sitekey: string;
  size?: "compact" | "flexible" | "normal";
  theme?: "auto" | "dark" | "light";
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
};

declare global {
  interface Window {
    turnstile?: {
      remove: (widgetId: TurnstileWidgetId) => void;
      render: (
        container: HTMLElement,
        options: TurnstileRenderOptions,
      ) => TurnstileWidgetId;
      reset: (widgetId: TurnstileWidgetId) => void;
    };
  }
}

const TURNSTILE_SCRIPT_WAIT_TIMEOUT = 1_500;

let turnstileScriptPromise: Promise<void> | null = null;

function getCurrentCspNonce() {
  const elements = document.querySelectorAll("script, style");
  for (const element of elements) {
    if (
      (element instanceof HTMLScriptElement ||
        element instanceof HTMLStyleElement) &&
      element.nonce
    ) {
      return element.nonce;
    }
  }

  return null;
}

function getExistingTurnstileScript() {
  const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID);
  return existingScript instanceof HTMLScriptElement ? existingScript : null;
}

function waitForExistingTurnstileScript() {
  const existingScript = getExistingTurnstileScript();
  if (existingScript) {
    return Promise.resolve(existingScript);
  }

  return new Promise<HTMLScriptElement | null>((resolve) => {
    const observer = new MutationObserver(() => {
      const script = getExistingTurnstileScript();
      if (!script) {
        return;
      }

      window.clearTimeout(timeoutId);
      observer.disconnect();
      resolve(script);
    });

    const timeoutId = window.setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, TURNSTILE_SCRIPT_WAIT_TIMEOUT);

    observer.observe(document.head, {
      childList: true,
    });
  });
}

function waitForTurnstileScriptLoad(script: HTMLScriptElement) {
  if (window.turnstile?.render) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Failed to load Turnstile script.")),
      { once: true },
    );
  });
}

function loadTurnstileScript() {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.turnstile?.render) {
    return Promise.resolve();
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }

  turnstileScriptPromise = waitForExistingTurnstileScript()
    .then((existingScript) => {
      if (window.turnstile?.render) {
        return;
      }

      if (existingScript) {
        return waitForTurnstileScriptLoad(existingScript);
      }

      const script = document.createElement("script");
      const nonce = getCurrentCspNonce();

      script.id = TURNSTILE_SCRIPT_ID;
      script.src = TURNSTILE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;

      if (nonce) {
        script.setAttribute("nonce", nonce);
        script.nonce = nonce;
      }

      const loadPromise = waitForTurnstileScriptLoad(script);
      document.head.append(script);

      return loadPromise;
    })
    .catch((error) => {
      turnstileScriptPromise = null;
      throw error;
    });

  return turnstileScriptPromise;
}

export function TurnstileWidget({
  action,
  className = "",
  inputName = TURNSTILE_RESPONSE_FIELD,
  onTokenChange,
  resetNonce = 0,
  siteKey,
  size = "flexible",
}: {
  action: string;
  className?: string;
  inputName?: string | null;
  onTokenChange?: (token: string | null) => void;
  resetNonce?: number;
  siteKey: string | null;
  size?: "compact" | "flexible" | "normal";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<TurnstileWidgetId | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const previousResetRef = useRef(resetNonce);
  const [message, setMessage] = useState<string | null>(
    siteKey ? "Loading verification..." : null,
  );
  const [token, setToken] = useState("");

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  const handleTokenChange = useCallback((value: string | null) => {
    setToken(value ?? "");
    onTokenChangeRef.current?.(value);
  }, []);

  useEffect(() => {
    if (!siteKey) {
      return;
    }

    let cancelled = false;

    const renderWidget = () => {
      if (
        !containerRef.current ||
        widgetIdRef.current !== null ||
        !window.turnstile?.render
      ) {
        return;
      }

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        action,
        size,
        theme: "light",
        callback: (nextToken) => {
          setMessage(null);
          handleTokenChange(nextToken);
        },
        "expired-callback": () => {
          setMessage("Verification expired. Please complete it again.");
          handleTokenChange(null);
        },
        "error-callback": () => {
          setMessage("Verification failed to load. Please try again.");
          handleTokenChange(null);
        },
      });

      setMessage(null);
    };

    void loadTurnstileScript()
      .then(() => {
        if (cancelled) {
          return;
        }

        renderWidget();
      })
      .catch(() => {
        if (!cancelled) {
          setMessage("Verification failed to load. Please try again.");
          handleTokenChange(null);
        }
      });

    return () => {
      cancelled = true;

      if (widgetIdRef.current !== null && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [action, handleTokenChange, siteKey, size]);

  useEffect(() => {
    if (resetNonce === previousResetRef.current) {
      return;
    }

    previousResetRef.current = resetNonce;
    setMessage(null);
    handleTokenChange(null);

    if (widgetIdRef.current !== null && window.turnstile?.reset) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, [handleTokenChange, resetNonce]);

  if (!siteKey) {
    return null;
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div ref={containerRef} className="min-h-[65px]" />
      {message && (
        <p aria-live="polite" className="text-sm leading-5 text-foreground/60">
          {message}
        </p>
      )}
      {inputName ? (
        <input type="hidden" name={inputName} value={token} />
      ) : null}
    </div>
  );
}
