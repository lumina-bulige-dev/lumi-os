export const runtime = "edge";         // or "nodejs"
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
// 必要に応じて features の検証ロジック/型を参照
// import { VerifyResponse } from "@features/verify";

export async function GET(req: Request) {
  const url = new URL(req.url);
  // ...実処理
  return NextResponse.json({ ok: true });
}
