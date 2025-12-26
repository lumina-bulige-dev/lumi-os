// luminabulige_app/app/api/cia/route.ts
import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

type KycRow = {
  user_id: string;
  display_name: string;
  kyc_vendor: string | null;
  kyc_status: string | null;
  kyc_level: string | null;
  kyc_reference_id: string | null;
  kyc_verified_at: number | null; // INTEGER (UNIX秒)
};

type CiaResponse = {
  ok: boolean;
  userId: string;
  kyc?: {
    userId: string;
    displayName: string;
    kycVendor: string | null;
    kycStatus: string | null;
    kycLevel: string | null;
    kycReferenceId: string | null;
    kycVerifiedAt: number | null;
  } | null;
  error?: string;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId") || "demo-user-001";

  // Cloudflare Pages（next-on-pages）から env を取る
  const { env } = getRequestContext();

  // ★ ここ、D1 バインディング名に合わせて変える
  // 例: Pages の設定で binding 名を LUMI_CORE_DB にしている想定
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = (env as any).LUMI_CORE_DB as any;

  if (!db) {
    // バインディング設定忘れ用の保険
    return NextResponse.json<CiaResponse>(
      { ok: false, userId, error: "D1_BINDING_NOT_FOUND" },
      { status: 500 }
    );
  }

  try {
    const stmt = db
      .prepare(
        `
        SELECT
          user_id,
          display_name,
          kyc_vendor,
          kyc_status,
          kyc_level,
          kyc_reference_id,
          kyc_verified_at
        FROM user_kyc
        WHERE user_id = ?
      `
      )
      .bind(userId);

    const row = (await stmt.first<KycRow>()) || null;

    if (!row) {
      return NextResponse.json<CiaResponse>(
        { ok: false, userId, kyc: null, error: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json<CiaResponse>({
      ok: true,
      userId,
      kyc: {
        userId: row.user_id,
        displayName: row.display_name,
        kycVendor: row.kyc_vendor,
        kycStatus: row.kyc_status,
        kycLevel: row.kyc_level,
        kycReferenceId: row.kyc_reference_id,
        kycVerifiedAt: row.kyc_verified_at,
      },
    });
  } catch (err) {
    console.error("CIA API DB error", err);
    return NextResponse.json<CiaResponse>(
      { ok: false, userId, error: "DB_ERROR" },
      { status: 500 }
    );
  }
}
