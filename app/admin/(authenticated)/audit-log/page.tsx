import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  "subscriber.joined": "Subscriber Joined",
  "subscriber.confirmed": "Subscriber Confirmed",
  "subscriber.unsubscribed": "Subscriber Unsubscribed",
  "subscriber.resubscribed": "Subscriber Resubscribed",
  "subscriber.resend_confirmation": "Resent Confirmation",
  "subscriber.deleted": "Subscriber Deleted",
  "subscriber.exported": "Subscribers Exported",
  "email.sent": "Email Sent",
  "email.created": "Email Created",
  "admin.login": "Admin Login",
  "admin.logout": "Admin Logout",
};

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageStr || "1", 10));
  const perPage = 50;
  const offset = (page - 1) * perPage;

  const sql = getDb();

  const [logs, totalResult] = await Promise.all([
    sql`
      SELECT * FROM audit_logs
      ORDER BY created_at DESC
      LIMIT ${perPage} OFFSET ${offset}
    `,
    sql`SELECT COUNT(*) as count FROM audit_logs`,
  ]);

  const total = Number(totalResult[0].count);
  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="p-8">
      <h1 className="mb-8 font-bold text-3xl text-foreground">Audit Log</h1>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface">
            <tr>
              <th className="px-4 py-3 font-medium text-foreground/70">
                Timestamp
              </th>
              <th className="px-4 py-3 font-medium text-foreground/70">
                Action
              </th>
              <th className="px-4 py-3 font-medium text-foreground/70">
                Entity
              </th>
              <th className="px-4 py-3 font-medium text-foreground/70">
                Actor
              </th>
              <th className="px-4 py-3 font-medium text-foreground/70">
                Details
              </th>
              <th className="px-4 py-3 font-medium text-foreground/70">IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-border last:border-0">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-foreground/60">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-block rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-foreground">
                    {ACTION_LABELS[log.action] ?? log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-foreground/60">
                  {log.entity_type}
                  {log.entity_id ? ` / ${log.entity_id.slice(0, 8)}...` : ""}
                </td>
                <td className="px-4 py-3 text-xs text-foreground/60">
                  {log.actor}
                </td>
                <td className="max-w-48 truncate px-4 py-3 font-mono text-xs text-foreground/50">
                  {log.metadata && Object.keys(log.metadata).length > 0
                    ? JSON.stringify(log.metadata)
                    : "-"}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-foreground/50">
                  {log.ip_address || "-"}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-foreground/50"
                >
                  No audit logs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-foreground/60">
          <span>
            Showing {offset + 1}–{Math.min(offset + perPage, total)} of {total}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/admin/audit-log?page=${page - 1}`}
                className="rounded-sm bg-surface px-3 py-1 text-foreground hover:bg-foreground/10"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/admin/audit-log?page=${page + 1}`}
                className="rounded-sm bg-surface px-3 py-1 text-foreground hover:bg-foreground/10"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
