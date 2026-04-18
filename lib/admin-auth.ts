import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";
const COOKIE_MAX_AGE = 8 * 60 * 60;
const LEGACY_COOKIE_PATH = "/admin";
const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_AUTH_KEY ?? "fallback-dev-key-min-16ch",
);

export async function createAdminSession() {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.delete({ name: COOKIE_NAME, path: LEGACY_COOKIE_PATH });
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const tokens = cookieStore.getAll(COOKIE_NAME);

  for (const token of tokens) {
    try {
      await jwtVerify(token.value, JWT_SECRET);
      return true;
    } catch {}
  }

  return false;
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete({ name: COOKIE_NAME, path: "/" });
  cookieStore.delete({ name: COOKIE_NAME, path: LEGACY_COOKIE_PATH });
}

export function validateAuthKey(key: string): boolean {
  const expected = process.env.ADMIN_AUTH_KEY;
  if (!expected) return false;
  if (key.length !== expected.length) return false;
  let result = 0;
  for (let i = 0; i < key.length; i++) {
    result |= key.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return result === 0;
}
