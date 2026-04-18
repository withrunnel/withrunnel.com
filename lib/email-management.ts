import { jwtVerify, SignJWT } from "jose";
import { nanoid } from "nanoid";
import { getDb } from "./db";
import { sanitizeEmail, sanitizeInput } from "./sanitize";

const EMAIL_MANAGEMENT_AUDIENCE = "email-management";
const EMAIL_MANAGEMENT_ISSUER = "withrunnel.com";
const EMAIL_MANAGEMENT_TOKEN_TTL = "365d";
const EMAIL_MANAGEMENT_SECRET = new TextEncoder().encode(
  process.env.EMAIL_MANAGEMENT_TOKEN_SECRET ??
    process.env.ADMIN_AUTH_KEY ??
    "fallback-dev-key-min-16ch",
);

export type EmailManagementClaims = {
  subscriberId?: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type EmailManagementSubscriber = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: "pending_confirmation" | "confirmed" | "unsubscribed";
  marketing_emails: boolean;
};

export async function createEmailManagementToken(input: {
  subscriberId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
}) {
  const email = sanitizeEmail(input.email);
  if (!email) {
    throw new Error("Email is required to create an email management token.");
  }

  const firstName = sanitizeInput(input.firstName || "");
  const lastName = sanitizeInput(input.lastName || "");

  return new SignJWT({
    email,
    firstName,
    lastName,
    subscriberId: input.subscriberId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setAudience(EMAIL_MANAGEMENT_AUDIENCE)
    .setIssuer(EMAIL_MANAGEMENT_ISSUER)
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime(EMAIL_MANAGEMENT_TOKEN_TTL)
    .sign(EMAIL_MANAGEMENT_SECRET);
}

export async function verifyEmailManagementToken(
  token: string,
): Promise<EmailManagementClaims | null> {
  try {
    const { payload } = await jwtVerify(token, EMAIL_MANAGEMENT_SECRET, {
      audience: EMAIL_MANAGEMENT_AUDIENCE,
      issuer: EMAIL_MANAGEMENT_ISSUER,
      algorithms: ["HS256"],
    });

    if (typeof payload.email !== "string") {
      return null;
    }

    return {
      subscriberId:
        typeof payload.subscriberId === "string"
          ? payload.subscriberId
          : undefined,
      email: sanitizeEmail(payload.email),
      firstName:
        typeof payload.firstName === "string"
          ? sanitizeInput(payload.firstName)
          : "",
      lastName:
        typeof payload.lastName === "string"
          ? sanitizeInput(payload.lastName)
          : "",
    };
  } catch {
    return null;
  }
}

export async function findSubscriberForEmailManagement(
  claims: EmailManagementClaims,
): Promise<EmailManagementSubscriber | null> {
  const sql = getDb();

  const byEmail = await sql`
    SELECT id, email, first_name, last_name, status, marketing_emails
    FROM subscribers
    WHERE email = ${claims.email}
  `;

  if (byEmail.length > 0) {
    return byEmail[0] as EmailManagementSubscriber;
  }

  if (!claims.subscriberId) {
    return null;
  }

  const byId = await sql`
    SELECT id, email, first_name, last_name, status, marketing_emails
    FROM subscribers
    WHERE id = ${claims.subscriberId}
  `;

  if (byId.length === 0) {
    return null;
  }

  return byId[0] as EmailManagementSubscriber;
}

export function getEmailManagementUrl(
  path: "/unsubscribe" | "/email-preferences" | "/resubscribe",
  token: string,
) {
  return `${process.env.NEXT_PUBLIC_BASE_URL!}${path}?token=${encodeURIComponent(token)}`;
}
