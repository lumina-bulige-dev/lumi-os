// luminabulige_app/app/api/cia/route.ts
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

type RowObj = Record<string, unknown>;

async function d1All<T = RowObj>(sql: string, binds: unknown[] = []) {
  const { env } = getRequestContext();
  const res = await env.DB.prepare(sql).bind(...binds).all<T>();
  return res.results ?? [];
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("user_id") ?? "test-user";
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "12"), 24);

  // 月次カード（Customer）
  const months = await d1All(
    `SELECT
       ym_jst, headline_ja, highlight_ja,
       safe_rate_pct, trust_flag, institutional_score,
       total_count, danger_count, risk_count, last_proof_id
     FROM v_cia_customer
     WHERE user_id = ?
     ORDER BY ym_jst DESC
     LIMIT ?`,
    [userId, limit]
  );

  // 監査用（Institutional）
  const institutional = await d1All(
    `SELECT
       ym_jst, trust_flag, strength_score, institutional_score,
       safe_rate_pct, total_count, danger_count, risk_count, last_proof_id
     FROM v_cia_institutional
     WHERE user_id = ?
     ORDER BY ym_jst DESC
     LIMIT ?`,
    [userId, limit]
  );

  // bucket / reason rollups
  const bucket = await d1All(
    `SELECT ym_jst, bucket, cnt, danger_cnt, risk_cnt, last_proof_id
     FROM monthly_bucket_rollups
     WHERE user_id = ?
     ORDER BY ym_jst DESC, bucket ASC`,
    [userId]
  );

  const reasons = await d1All(
    `SELECT ym_jst, reason_code, bucket, cnt, danger_cnt, risk_cnt, last_proof_id
     FROM monthly_reason_rollups
     WHERE user_id = ?
     ORDER BY ym_jst DESC, cnt DESC`,
    [userId]
  );

  // 直近イベント（Appendix用）
  const events = await d1All(
    `SELECT ts, day_jst, ym_jst, type, label, reason_code, bucket, title_ja, proof_id
     FROM v_events_reasoned
     WHERE user_id = ?
     ORDER BY ts DESC
     LIMIT 50`,
    [userId]
  );

  return Response.json({ userId, months, institutional, bucket, reasons, events });
}
