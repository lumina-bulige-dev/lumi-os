// app/proof/route.ts
//import { NextResponse } from "next/server";

type WeeklyRow = {
  week: number;
  spent: number;
  saved: number;
  notes: string | null;
  created_at: string;
};

type Metrics = {
  SR12: number; RE12: number; RW12: number; WC12: number;
  SR6: number;  RE6: number;  RW6: number;  WC6: number;
  SR3: number;  RE3: number;  RW3: number;  WC3: number;
  SR24?: number; RE24?: number; RW24?: number; WC24?: number;
  SR36?: number; RE36?: number; RW36?: number; WC36?: number;
};

function clamp01(x: number) { return Math.max(0, Math.min(1, x)); }

function riskEventFromNotes(notes?: string | null) {
  if (!notes) return 0;
  const s = notes.toLowerCase();
  // MVPの暫定：自己申告テキストに反応（後でイベントログに置換）
  const keys = ["delay", "late", "overdraft", "revolve", "延滞", "滞納", "残高0", "借入", "リボ"];
  return keys.some(k => s.includes(k)) ? 1 : 0;
}

function computeMetrics(rows: WeeklyRow[], weeklyTarget: number): Metrics {
  // rows: 新しい順でも古い順でもOK。ここでは週番号でソート
  const sorted = [...rows].sort((a,b) => a.week - b.week);

  function sliceLast(n: number) { return sorted.slice(Math.max(0, sorted.length - n)); }

  function calc(sub: WeeklyRow[]) {
    if (sub.length === 0) return { SR: 0, RE: 0, RW: 0, WC: 0 };
    let srSum = 0;
    let wc = 0;
    let re = 0;
    let rw = 0;

    for (const r of sub) {
      wc += 1;
      const target = weeklyTarget > 0 ? weeklyTarget : 0;
      const savingRate = target > 0 ? (r.saved / target) : 0;
      srSum += savingRate;

      if (savingRate <= 0.30) rw += 1;
      re += riskEventFromNotes(r.notes);
    }
    return { SR: srSum / wc, RE: re, RW: rw, WC: wc };
  }

  // 12m=52週, 6m=26週, 3m=13週（週次運用前提）
  const m12 = calc(sliceLast(52));
  const m6  = calc(sliceLast(26));
  const m3  = calc(sliceLast(13));
  const m24 = calc(sliceLast(104));
  const m36 = calc(sliceLast(156));

  return {
    SR12: m12.SR, RE12: m12.RE, RW12: m12.RW, WC12: m12.WC,
    SR6:  m6.SR,  RE6:  m6.RE,  RW6:  m6.RW,  WC6:  m6.WC,
    SR3:  m3.SR,  RE3:  m3.RE,  RW3:  m3.RW,  WC3:  m3.WC,
    SR24: m24.SR, RE24: m24.RE, RW24: m24.RW, WC24: m24.WC,
    SR36: m36.SR, RE36: m36.RE, RW36: m36.RW, WC36: m36.WC,
  };
}

function internalRankFromMetrics(m: Metrics) {
  // MVPの内部ランク（後でF/Dを足す前提で“薄く”）
  // SR12が高いほど良い。直近の赤( RW3 )や risk( RE3 )が少ないほど良い。
  // ※ “減点主義”に寄せすぎないよう、ここは「recentの状態指標」として扱う。
  const srScore = clamp01(m.SR12 / 1.50);      // 1.50で満点
  const rwPenalty = clamp01(1 - (m.RW12 / 6)); // 年6回赤週で0
  const rePenalty = clamp01(1 - (m.RE12 / 3)); // 年3回で0

  const recentClean = (m.RE3 === 0 ? 1 : 0) * (m.RW3 === 0 ? 1 : 0);
  const score01 = 0.55 * srScore + 0.25 * rwPenalty + 0.20 * rePenalty;
  const score = Math.round(score01 * 100);

  // ランク帯（仮）：データで調整
  let tier: "A+" | "A" | "B" | "C" | "D" | "E" = "C";
  if (score >= 92 && recentClean) tier = "A+";
  else if (score >= 85) tier = "A";
  else if (score >= 70) tier = "B";
  else if (score >= 50) tier = "C";
  else if (score >= 30) tier = "D";
  else tier = "E";

  return { score_behavior: score, rank_tier: tier };
}

function externalUnlock(m: Metrics, rankTier: string, isHRZ: boolean) {
  // External A 条件（仕様書をそのまま if）  [oai_citation:21‡BULIGE Rank 外部解禁条件仕様 v1 （LUMINA BULIGE : A・A+ユーザー向け信用レポート基準）.txt](file-service://file-Utum874ZZWyhgdwTQ6EGC4)
  const baseOk =
    (rankTier === "A" || rankTier === "A+") &&
    m.SR12 >= 1.25 &&
    m.RE12 === 0 &&
    m.RW12 <= 2 &&
    m.WC12 >= 40 &&
    m.SR3 >= 1.0 &&
    m.RE3 === 0;

  if (!baseOk) return { credit_flag: 0, reason: "not_meet_external_A" };

  if (!isHRZ) return { credit_flag: 1, reason: "external_A" };

  // HRZ追加条件（例）  [oai_citation:22‡BULIGE Rank 外部解禁条件仕様 v1 （LUMINA BULIGE : A・A+ユーザー向け信用レポート基準）.txt](file-service://file-Utum874ZZWyhgdwTQ6EGC4)
  const hrzOk =
    (m.RE6 === 0) &&
    (m.RW6 === 0) &&
    (m.SR6 >= 1.0) &&
    ((m.RE24 ?? 999) <= 2);

  return hrzOk ? { credit_flag: 1, reason: "external_A_hrz_ok" }
               : { credit_flag: 0, reason: "hrz_need_more_stability" };
}

export async function GET(req: Request, context: any) {
  const { searchParams } = new URL(req.url);
  const participantId = searchParams.get("participantId");
  if (!participantId) {
    return NextResponse.json({ ok: false, error: "participantId required" }, { status: 400 });
  }

  const DB = context?.env?.DB;
  if (!DB) return NextResponse.json({ ok: false, error: "DB not configured" }, { status: 500 });

  // participants
  const p = await DB.prepare(`SELECT id, weekly_amount, notes FROM participants WHERE id = ?`)
    .bind(participantId).first();

  if (!p) return NextResponse.json({ ok: false, error: "participant not found" }, { status: 404 });

  const weeklyTarget = Number(p.weekly_amount ?? 0);

  // weekly_reports
  const rows = await DB.prepare(
    `SELECT week, spent, saved, notes, created_at
     FROM weekly_reports
     WHERE participant_id = ?
     ORDER BY week ASC`
  ).bind(participantId).all();

  const weekly: WeeklyRow[] = (rows?.results ?? []) as any;
  const metrics = computeMetrics(weekly, weeklyTarget);
  const internal = internalRankFromMetrics(metrics);

  // HRZ判定は最初は「過去にD/Eがあったら」などを別テーブルで持つのが理想。
  // MVPでは participants.notes に 'HRZ' が入っていたら true などで暫定運用。
  const isHRZ = String(p.notes ?? "").includes("HRZ");

  const ext = externalUnlock(metrics, internal.rank_tier, isHRZ);

  return NextResponse.json({
    ok: true,
    participantId,
    weeklyTarget,
    metrics,
    internal,
    external: ext,
  });
}

export async function POST(req: Request, context: any) {
  // 再計算して participants に保存する（管理/バッチ用）
  const DB = context?.env?.DB;
  if (!DB) return NextResponse.json({ ok: false, error: "DB not configured" }, { status: 500 });

  const body = await req.json().catch(() => null);
  const participantId = body?.participantId;
  if (!participantId) {
    return NextResponse.json({ ok: false, error: "participantId required" }, { status: 400 });
  }

  // GETと同じロジックで計算（共通化推奨）
  const p = await DB.prepare(`SELECT id, weekly_amount, notes FROM participants WHERE id = ?`)
    .bind(participantId).first();
  if (!p) return NextResponse.json({ ok: false, error: "participant not found" }, { status: 404 });

  const weeklyTarget = Number(p.weekly_amount ?? 0);
  const rows = await DB.prepare(
    `SELECT week, spent, saved, notes, created_at
     FROM weekly_reports
     WHERE participant_id = ?
     ORDER BY week ASC`
  ).bind(participantId).all();

  const weekly: WeeklyRow[] = (rows?.results ?? []) as any;
  const metrics = computeMetrics(weekly, weeklyTarget);
  const internal = internalRankFromMetrics(metrics);
  const isHRZ = String(p.notes ?? "").includes("HRZ");
  const ext = externalUnlock(metrics, internal.rank_tier, isHRZ);

  const now = new Date().toISOString();
  await DB.prepare(
    `UPDATE participants
       SET score_behavior = ?, rank_tier = ?, credit_flag = ?, last_update = ?
     WHERE id = ?`
  ).bind(internal.score_behavior, internal.rank_tier, ext.credit_flag, now, participantId).run();

  return NextResponse.json({ ok: true, participantId, internal, external: ext, updatedAt: now });
}
