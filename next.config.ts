import type { NextConfig } from "next";

const TURNSTILE_ORIGIN = "https://challenges.cloudflare.com";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${TURNSTILE_ORIGIN}`,
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob:",
            "font-src 'self'",
            `connect-src 'self' ${TURNSTILE_ORIGIN}`,
            `frame-src 'self' ${TURNSTILE_ORIGIN}`,
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join("; "),
        },
      ],
    },
  ],
};

export default nextConfig;
