import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ADMIN_SESSION_COOKIE = "admin_session";
const ADMIN_SESSION_COOKIE_MAX_AGE = 8 * 60 * 60;
const LEGACY_ADMIN_SESSION_COOKIE_PATH = "/admin";

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );

  if (request.nextUrl.pathname.startsWith("/admin")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate",
    );

    const adminSession = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (adminSession) {
      response.cookies.delete({
        name: ADMIN_SESSION_COOKIE,
        path: LEGACY_ADMIN_SESSION_COOKIE_PATH,
      });
      response.cookies.set(ADMIN_SESSION_COOKIE, adminSession, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: ADMIN_SESSION_COOKIE_MAX_AGE,
        path: "/",
      });
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
