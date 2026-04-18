import Link from "next/link";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EmailsPage() {
  const sql = getDb();
  const emails = await sql`
    SELECT * FROM email_sends ORDER BY created_at DESC LIMIT 50
  `;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-bold text-3xl text-foreground">Emails</h1>
        <Link
          href="/admin/emails/compose"
          className="rounded-sm bg-foreground px-4 py-2 text-sm font-medium text-text-light transition-opacity hover:opacity-90"
        >
          Compose Email
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface">
            <tr>
              <th className="px-4 py-3 font-medium text-foreground/70">
                Subject
              </th>
              <th className="px-4 py-3 font-medium text-foreground/70">
                Recipients
              </th>
              <th className="px-4 py-3 font-medium text-foreground/70">Sent</th>
              <th className="px-4 py-3 font-medium text-foreground/70">
                Status
              </th>
              <th className="px-4 py-3 font-medium text-foreground/70">
                Created
              </th>
            </tr>
          </thead>
          <tbody>
            {emails.map((email) => (
              <tr
                key={email.id}
                className="border-b border-border last:border-0"
              >
                <td className="px-4 py-3 font-medium text-foreground">
                  {email.subject}
                </td>
                <td className="px-4 py-3 text-foreground/60">
                  {email.recipient_filter}
                </td>
                <td className="px-4 py-3 text-foreground/60">
                  {email.sent_count}
                </td>
                <td className="px-4 py-3">
                  <EmailStatusBadge status={email.status} />
                </td>
                <td className="px-4 py-3 text-foreground/60">
                  {new Date(email.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {emails.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-foreground/50"
                >
                  No emails sent yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmailStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    sending: "bg-blue-100 text-blue-800",
    sent: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-800"}`}
    >
      {status}
    </span>
  );
}
