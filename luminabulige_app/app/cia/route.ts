// app/api/cia/route.ts
/*import { NextResponse } from "next/server";

type CIAReportRow = {
  user_id: string;
  ym_jst: string;
  headline_ja: string;
  highlight_ja: string;
  safe_rate_pct: number;
  trust_flag: number;
  institutional_score: number;
  total_count: number;
  danger_count: number;
  risk_count: number;
  last_proof_id: string | null;
};

type CIAAppendixRow = {
  user_id: string;
  ym_jst: string;
  raw_x1e4: number;
  cap_x1e4: number;
  safe_rate_pct: number;
  trust_flag: number;
  strength_score: number;
  institutional_score: number;
  total_count: number;
  danger_count: number;
  risk_count: number;
  last_proof_id: string | null;
};

type CIAResponse = {
  userId: string;
  report: CIAReportRow[];
  appendix: CIAAppendixRow[];
  meta?: {
    generated_at_ts?: number;
    range?: { fromYm?: string; toYm?: string };
  };
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId") || "test-user";

  const now = new Date();
  const ym =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0");

  const report: CIAReportRow[] = [
    {
      user_id: userId,
      ym_jst: ym,
      headline_ja: "テスト版 CIA レポート",
      highlight_ja:
        "まだ本番データは連携されていません。これはダミーの月次レポートです。",
      safe_rate_pct: 99.9999,
      trust_flag: 0,
      institutional_score: 80,
      total_count: 30,
      danger_count: 1,
      risk_count: 2,
      last_proof_id: null,
    },
  ];

  const appendix: CIAAppendixRow[] = [
    {
      user_id: userId,
      ym_jst: ym,
      raw_x1e4: 999900,
      cap_x1e4: 999900,
      safe_rate_pct: 99.9999,
      trust_flag: 0,
      strength_score: 75,
      institutional_score: 80,
      total_count: 30,
      danger_count: 1,
      risk_count: 2,
      last_proof_id: null,
    },
  ];

  const body: CIAResponse = {
    userId,
    report,
    appendix,
    meta: {
      generated_at_ts: Date.now(),
      range: { fromYm: ym, toYm: ym },
    },
  };

  return NextResponse.json(body);
}*/  // ← 最後の行
