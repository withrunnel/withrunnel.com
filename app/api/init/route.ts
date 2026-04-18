import { NextResponse } from "next/server";
import { initDb } from "@/lib/db";

export async function POST(request: Request) {
  const authKey = request.headers.get("x-auth-key");
  if (authKey !== process.env.ADMIN_AUTH_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await initDb();
    return NextResponse.json({ ok: true, message: "Database initialized" });
  } catch (error) {
    console.error("DB init error:", error);
    return NextResponse.json(
      { error: "Failed to initialize database" },
      { status: 500 },
    );
  }
}
