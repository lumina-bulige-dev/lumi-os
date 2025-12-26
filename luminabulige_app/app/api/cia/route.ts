// luminabulige_app/app/api/cia/route.ts
import { NextResponse } from "next/server";

export const runtime = "edge";

export type KycRecord = {
  userId: string;
  displayName: string;
  kycVendor: string;
  kycStatus: string;
  kycLevel: string;
  kycReferenceId: string;
  kycVerifiedAt: number; // UNIX秒
};

type ApiResponse = {
  ok: boolean;
  user: KycRecord | null;
  error?: string;
};

// いまは D1 ではなく、固定モック
const MOCK_KYC: KycRecord = {
  userId: "demo-user-001",
  displayName: "デモ太郎",
  kycVendor: "TrastDock",
  kycStatus: "VERIFIED",
  kycLevel: "LEVEL_2",
  kycReferenceId: "TDK-REF-0001",
  kycVerifiedAt: 1766708172,
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId") ?? "demo-user-001";

  // いまは userId を見ても常に同じモックを返す
  const record = { ...MOCK_KYC, userId };

  const body: ApiResponse = {
    ok: true,
    user: record,
  };

  return NextResponse.json(body);
}
