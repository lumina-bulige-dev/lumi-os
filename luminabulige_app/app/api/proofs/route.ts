import { NextResponse } from "next/server";

// Cloudflare / edge 前提なら付けてOK（不要なら削除してもビルドは通る）
export const runtime = "edge";

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "Not implemented yet" },
    { status: 501 }
  );
}
