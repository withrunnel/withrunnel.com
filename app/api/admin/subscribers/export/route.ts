import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { deleteExpiredPendingSubscribers, getDb } from "@/lib/db";

export async function GET() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();
  await deleteExpiredPendingSubscribers();
  const subscribers = await sql`
    SELECT email, first_name, last_name, status, marketing_emails, referral_source, created_at, confirmed_at
    FROM subscribers
    WHERE status != 'unsubscribed'
    ORDER BY created_at DESC
  `;

  const headers = [
    "email",
    "first_name",
    "last_name",
    "status",
    "marketing_emails",
    "referral_source",
    "created_at",
    "confirmed_at",
  ];

  const csvRows = [headers.join(",")];
  for (const row of subscribers) {
    const values = headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return "";
      const str = String(val);
      return str.includes(",") || str.includes('"')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    });
    csvRows.push(values.join(","));
  }

  await logAudit({
    action: "subscriber.exported",
    entityType: "subscriber",
    actor: "admin",
    metadata: { count: subscribers.length },
  });

  return new NextResponse(csvRows.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="subscribers.csv"`,
    },
  });
}
