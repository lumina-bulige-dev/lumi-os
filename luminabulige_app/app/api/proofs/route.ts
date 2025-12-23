// app/api/proofs/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // 例: query 取得
  const { searchParams } = new URL(req.url);
  const proofId = searchParams.get("proofId");


export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({ ok: true, body });
}
  // TODO: 本来の処理に置き換え
  return NextResponse.json({ ok: true, proofId });
}
