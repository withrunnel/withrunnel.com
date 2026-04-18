import { neon } from "@neondatabase/serverless";

export const CONFIRMATION_TOKEN_TTL_MS = 60 * 60 * 1000;

export function getDb() {
  const sql = neon(process.env.DATABASE_URL!);
  return sql;
}

export function getConfirmationTokenExpiry() {
  return new Date(Date.now() + CONFIRMATION_TOKEN_TTL_MS);
}

export async function deleteExpiredPendingSubscribers(input?: {
  email?: string;
}) {
  const sql = getDb();

  if (input?.email) {
    return await sql`
      DELETE FROM subscribers
      WHERE status = 'pending_confirmation'
        AND email = ${input.email}
        AND confirmation_token_expires_at IS NOT NULL
        AND confirmation_token_expires_at <= NOW()
      RETURNING id
    `;
  }

  return await sql`
    DELETE FROM subscribers
    WHERE status = 'pending_confirmation'
      AND confirmation_token_expires_at IS NOT NULL
      AND confirmation_token_expires_at <= NOW()
    RETURNING id
  `;
}

export async function initDb() {
  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS subscribers (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      first_name TEXT NOT NULL DEFAULT '',
      last_name TEXT NOT NULL DEFAULT '',
      referral_source TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending_confirmation' CHECK (status IN ('pending_confirmation', 'confirmed', 'unsubscribed')),
      marketing_emails BOOLEAN NOT NULL DEFAULT false,
      confirmation_token TEXT UNIQUE,
      confirmation_token_expires_at TIMESTAMPTZ,
      confirmed_at TIMESTAMPTZ,
      unsubscribed_at TIMESTAMPTZ,
      tos_accepted_at TIMESTAMPTZ NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      actor TEXT NOT NULL DEFAULT 'system',
      metadata JSONB DEFAULT '{}',
      ip_address TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS email_sends (
      id TEXT PRIMARY KEY,
      subject TEXT NOT NULL,
      content_mdx TEXT NOT NULL,
      recipient_filter TEXT NOT NULL DEFAULT 'all',
      sent_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent', 'failed')),
      sent_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_subscribers_confirmation_token ON subscribers(confirmation_token)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_subscribers_pending_expiry ON subscribers(status, confirmation_token_expires_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id)`;
}
