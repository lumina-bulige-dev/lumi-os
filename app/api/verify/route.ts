// app/api/verify/route.ts
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";       // これで静的化を禁止
export const revalidate = 0;                  // キャッシュ無効
export const fetchCache = "force-no-store";   // 取得キャッシュ回避（任意）

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
