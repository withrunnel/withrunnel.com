import { nanoid } from "nanoid";
import { getDb } from "./db";

export type AuditAction =
  | "subscriber.joined"
  | "subscriber.confirmed"
  | "subscriber.unsubscribed"
  | "subscriber.resubscribed"
  | "subscriber.resend_confirmation"
  | "subscriber.deleted"
  | "subscriber.exported"
  | "email.sent"
  | "email.created"
  | "admin.login"
  | "admin.logout";

export async function logAudit(params: {
  action: AuditAction;
  entityType: string;
  entityId?: string;
  actor?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}) {
  const sql = getDb();
  const id = nanoid();
  await sql`
    INSERT INTO audit_logs (id, action, entity_type, entity_id, actor, metadata, ip_address)
    VALUES (${id}, ${params.action}, ${params.entityType}, ${params.entityId ?? null}, ${params.actor ?? "system"}, ${JSON.stringify(params.metadata ?? {})}, ${params.ipAddress ?? null})
  `;
  return id;
}
