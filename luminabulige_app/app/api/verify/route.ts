export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const proofId = url.searchParams.get("proofId");
  return NextResponse.json({ ok: true, proofId });
}
