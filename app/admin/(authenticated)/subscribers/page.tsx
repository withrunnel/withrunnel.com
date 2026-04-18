import { getDb } from "@/lib/db";
import {
  DeleteSubscriberButton,
  SubscriberActions,
} from "./subscriber-actions";

export const dynamic = "force-dynamic";

export default async function SubscribersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; q?: string }>;
}) {
  const { status, page: pageStr, q } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageStr || "1", 10));
  const perPage = 50;
  const offset = (page - 1) * perPage;

  const sql = getDb();

  const { subscribers, totalResult } = await (async () => {
    if (q) {
      const pattern = `%${q}%`;
      return {
        subscribers: await sql`
          SELECT * FROM subscribers
          WHERE email ILIKE ${pattern}
            OR first_name ILIKE ${pattern}
            OR last_name ILIKE ${pattern}
          ORDER BY created_at DESC
          LIMIT ${perPage} OFFSET ${offset}
        `,
        totalResult: await sql`
          SELECT COUNT(*) as count FROM subscribers
          WHERE email ILIKE ${pattern}
            OR first_name ILIKE ${pattern}
            OR last_name ILIKE ${pattern}
        `,
      };
    }
    if (status) {
      return {
        subscribers: await sql`
          SELECT * FROM subscribers WHERE status = ${status}
          ORDER BY created_at DESC LIMIT ${perPage} OFFSET ${offset}
        `,
        totalResult: await sql`
          SELECT COUNT(*) as count FROM subscribers WHERE status = ${status}
        `,
      };
    }
    return {
      subscribers: await sql`
        SELECT * FROM subscribers
        ORDER BY created_at DESC LIMIT ${perPage} OFFSET ${offset}
      `,
      totalResult: await sql`SELECT COUNT(*) as count FROM subscribers`,
    };
  })();

  const total = Number(totalResult[0].count);
  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-bold text-3xl text-foreground">Subscribers</h1>
        <SubscriberActions />
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <form className="flex items-center gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search by email or name..."
            className="h-9 w-64 rounded-lg bg-surface px-4 text-sm text-foreground outline-none placeholder:text-foreground/40 focus:ring-2 focus:ring-foreground/20"
          />
          <button
            type="submit"
            className="rounded-sm bg-foreground px-3 py-1.5 text-sm text-text-light"
          >
            Search
          </button>
        </form>
        <div className="flex gap-2">
          {[
            { value: "", label: "All" },
            { value: "confirmed", label: "Confirmed" },
            { value: "pending_confirmation", label: "Pending" },
            { value: "unsubscribed", label: "Unsubscribed" },
          ].map((filter) => (
            <a
              key={filter.value}
              href={`/admin/subscribers${filter.value ? `?status=${filter.value}` : ""}`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                (status || "") === filter.value
                  ? "bg-foreground text-text-light"
                  : "bg-surface text-foreground hover:bg-foreground/10"
              }`}
            >
              {filter.label}
            </a>
          ))}
        </div>
      </div>

      {/* Table */}
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
                Marketing
              </th>
              <th className="px-4 py-3 font-medium text-foreground/70">
                Source
              </th>
              <th className="px-4 py-3 font-medium text-foreground/70">
                Joined
              </th>
              <th className="px-4 py-3 font-medium text-foreground/70">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((sub) => (
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
                  {sub.marketing_emails ? "Yes" : "No"}
                </td>
                <td className="px-4 py-3 text-xs text-foreground/60">
                  {sub.referral_source || "-"}
                </td>
                <td className="px-4 py-3 text-foreground/60">
                  {new Date(sub.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <DeleteSubscriberButton subscriberId={sub.id} />
                </td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-foreground/50"
                >
                  No subscribers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-foreground/60">
          <span>
            Showing {offset + 1}–{Math.min(offset + perPage, total)} of {total}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/admin/subscribers?page=${page - 1}${status ? `&status=${status}` : ""}${q ? `&q=${q}` : ""}`}
                className="rounded-sm bg-surface px-3 py-1 text-foreground hover:bg-foreground/10"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/admin/subscribers?page=${page + 1}${status ? `&status=${status}` : ""}${q ? `&q=${q}` : ""}`}
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
