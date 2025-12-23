// app/api/proofs/route.ts
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // 必要なら特定ドメインに絞る
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const proofId = searchParams.get("proofId");

  return NextResponse.json({ ok: true, proofId }, { headers: corsHeaders });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  return NextResponse.json({ ok: true, body }, { headers: corsHeaders });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
