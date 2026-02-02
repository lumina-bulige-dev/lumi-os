import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const env = searchParams.get("env");
  const target = searchParams.get("target");

  if (!env || !target) {
    return NextResponse.json(
      { ok: false, error: "MISSING_PARAMS", message: "env and target are required." },
      { status: 400 }
    );
  }

  try {
    const db = await getDb();
    const result = await db.execute(
      `SELECT decision_id, env, target, updated_at
       FROM decision_latest
       WHERE env = ? AND target = ?
       LIMIT 1`,
      [env, target]
    );

    const row = result.results?.[0];
    if (!row) {
      return NextResponse.json({ ok: true, latest: null });
    }

    return NextResponse.json({ ok: true, latest: row });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "DB_QUERY_FAILED", message: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
