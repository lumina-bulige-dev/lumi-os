// luminabulige_app/app/api/cia/route.ts
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

export async function GET(req: Request) {
  const { env } = getRequestContext();
  const url = new URL(req.url);
  const userId = url.searchParams.get("user_id") ?? "test-user";

  const rows = await env.DB
    .prepare(
      "SELECT ym_jst, safe_rate_pct, trust_flag, strength_score, institutional_score, total_count, danger_count, risk_count, last_proof_id FROM v_cia_customer WHERE user_id=? ORDER BY ym_jst DESC LIMIT 12"
    )
    .bind(userId)
    .all();

  return Response.json({ ok: true, rows: rows.results });
}
