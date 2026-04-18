import { deleteExpiredPendingSubscribers, getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const sql = getDb();
  await deleteExpiredPendingSubscribers();

  const [
    totalResult,
    confirmedResult,
    pendingResult,
    unsubResult,
    recentResult,
  ] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM subscribers`,
    sql`SELECT COUNT(*) as count FROM subscribers WHERE status = 'confirmed'`,
    sql`SELECT COUNT(*) as count FROM subscribers WHERE status = 'pending_confirmation'`,
    sql`SELECT COUNT(*) as count FROM subscribers WHERE status = 'unsubscribed'`,
    sql`SELECT id, email, first_name, last_name, status, created_at FROM subscribers ORDER BY created_at DESC LIMIT 10`,
  ]);

  const stats = [
    { label: "Total Subscribers", value: totalResult[0].count },
    { label: "Confirmed", value: confirmedResult[0].count },
    { label: "Pending", value: pendingResult[0].count },
    { label: "Unsubscribed", value: unsubResult[0].count },
  ];

  return (
    <div className="p-8">
      <h1 className="mb-8 font-bold text-3xl text-foreground">Dashboard</h1>

      <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border p-6">
            <p className="text-sm text-foreground/60">{stat.label}</p>
            <p className="mt-1 font-bold text-3xl text-foreground">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <h2 className="mb-4 font-semibold text-xl text-foreground">
        Recent Subscribers
      </h2>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface">
            <tr>
              <th className="px-4 py-3 font-medium text-foreground/70">
                Email
              </th>
              <th className="px-4 py-3 font-medium text-foreground/70">Name</th>
              <th className="px-4 py-3 font-medium text-foreground/70">
                Status
              </th>
              <th className="px-4 py-3 font-medium text-foreground/70">
                Joined
              </th>
            </tr>
          </thead>
          <tbody>
            {recentResult.map((sub) => (
              <tr key={sub.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-mono text-xs text-foreground">
                  {sub.email}
                </td>
                <td className="px-4 py-3 text-foreground">
                  {sub.first_name} {sub.last_name}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={sub.status} />
                </td>
                <td className="px-4 py-3 text-foreground/60">
                  {new Date(sub.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {recentResult.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-foreground/50"
                >
                  No subscribers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: "bg-green-100 text-green-800",
    pending_confirmation: "bg-yellow-100 text-yellow-800",
    unsubscribed: "bg-red-100 text-red-800",
  };

  const labels: Record<string, string> = {
    confirmed: "Confirmed",
    pending_confirmation: "Pending",
    unsubscribed: "Unsubscribed",
  };

  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-800"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}
