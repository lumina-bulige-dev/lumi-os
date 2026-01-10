// app/api/verify/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const proofId = url.searchParams.get("proofId") || "";

  if (!proofId) {
    return NextResponse.json({ ok: false, error: "missing proofId" }, { status: 400 });
  }

  // ✅ ここを「Workersの verify」や「DB照合」に置き換えていく
  // いまは生存確認用
  return NextResponse.json({
    ok: true,
    proofId,
    status: "TODO",
    note: "verify実装はこれから差し替え",
  });
}
