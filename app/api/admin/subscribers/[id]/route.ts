import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { getDb } from "@/lib/db";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const sql = getDb();

  await sql`DELETE FROM subscribers WHERE id = ${id}`;

  await logAudit({
    action: "subscriber.deleted",
    entityType: "subscriber",
    entityId: id,
    actor: "admin",
  });

  return NextResponse.json({ ok: true });
}
