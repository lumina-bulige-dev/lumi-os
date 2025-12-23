import { NextResponse } from "next/server";

type Row = Record<string, any>;

/** 環境差が出るので、ここだけあなたの next-on-pages 実装に合わせて調整 */
function getDB(ctx: any) {
  // next-on-pages / Pages Functions では context.env.DB 等になるケースがある
  // ここはあなたの現状に合わせて差し替えてOK
  return (ctx as any)?.env?.DB || (globalThis as any)?.DB;
}

export async function GET(req: Request, ctx: any) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId") || "";
  const limit = Math.min(Number(url.searchParams.get("limit") || "12"), 36);

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const DB = getDB(ctx);
  if (!DB) {
    return NextResponse.json({ error: "DB binding not found" }, { status: 500 });
  }

  // v_cia_customer
  const reportRes = await DB.prepare(
    "SELECT * FROM v_cia_customer WHERE user_id=? ORDER BY ym_jst DESC LIMIT ?"
  ).bind(userId, limit).all<Row>();

  // v_cia_institutional
  const appendixRes = await DB.prepare(
    "SELECT * FROM v_cia_institutional WHERE user_id=? ORDER BY ym_jst DESC LIMIT ?"
  ).bind(userId, limit).all<Row>();

  return NextResponse.json({
    userId,
    report: reportRes.results ?? [],
    appendix: appendixRes.results ?? [],
    meta: { generated_at_ts: Math.floor(Date.now() / 1000) },
  });
}
