import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const env = searchParams.get("env");

  try {
    const db = await getDb();
    const result = await db.execute(
      `SELECT decision_id, env, issued_at, approved_at, approver
       FROM decisions
       ${env ? "WHERE env = ?" : ""}
       ORDER BY issued_at DESC
       LIMIT 50`,
      env ? [env] : []
    );

    return NextResponse.json({ ok: true, decisions: result.results ?? [] });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "DB_QUERY_FAILED", message: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
