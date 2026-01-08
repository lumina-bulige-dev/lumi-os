/* =========================
   006: CIA (Customer / Institutional)
   - (a && b) + c をDBで出す
========================= */

/* Institutional: 企業が欲しいやつ（判定と強度） */
CREATE VIEW IF NOT EXISTS v_cia_institutional AS
SELECT
  k.user_id,
  k.ym_jst,

  k.safe_rate_pct,
  k.cap_x1e4,
  k.total_count,
  k.danger_count,
  k.risk_count,
  k.last_proof_id,

  /* a && b: 信頼フラグ（例） */
  CASE
    WHEN k.safe_rate_pct >= 98
     AND k.danger_count = 0
     AND k.risk_count = 0
    THEN 1 ELSE 0
  END AS trust_flag,

  /* c: strength_score（簡易。月数×10 + log母数っぽい代替）
     log() が不安なら “段階スコア” にしておけば死なない */
  (
    10 * (SELECT COUNT(*) FROM monthly_rollups m2
          WHERE m2.user_id = k.user_id AND m2.total_count > 0)
    +
    CASE
      WHEN k.total_count >= 1000 THEN 30
      WHEN k.total_count >= 300  THEN 24
      WHEN k.total_count >= 100  THEN 20
      WHEN k.total_count >= 30   THEN 16
      WHEN k.total_count >= 10   THEN 12
      WHEN k.total_count >= 3    THEN 8
      WHEN k.total_count >= 1    THEN 3
      ELSE 0
    END
  ) AS strength_score,

  /* institutional_score = (a && b) + c */
  (
    100 * (CASE
      WHEN k.safe_rate_pct >= 98
       AND k.danger_count = 0
       AND k.risk_count = 0
      THEN 1 ELSE 0
    END)
    +
    (
      10 * (SELECT COUNT(*) FROM monthly_rollups m2
            WHERE m2.user_id = k.user_id AND m2.total_count > 0)
      +
      CASE
        WHEN k.total_count >= 1000 THEN 30
        WHEN k.total_count >= 300  THEN 24
        WHEN k.total_count >= 100  THEN 20
        WHEN k.total_count >= 30   THEN 16
        WHEN k.total_count >= 10   THEN 12
        WHEN k.total_count >= 3    THEN 8
        WHEN k.total_count >= 1    THEN 3
        ELSE 0
      END
    )
  ) AS institutional_score

FROM (
  SELECT
    user_id, ym_jst,
    safe_rate_pct, cap_x1e4,
    total_count, danger_count, risk_count,
    last_proof_id
  FROM v_monthly_kpis
) k;


/* Customer: “文章化テンプレ” をDBで作る（UIは表示するだけ） */
CREATE VIEW IF NOT EXISTS v_cia_customer AS
SELECT
  i.user_id,
  i.ym_jst,

  i.safe_rate_pct,
  i.trust_flag,
  i.strength_score,
  i.institutional_score,
  i.total_count,
  i.danger_count,
  i.risk_count,
  i.last_proof_id,

  /* 見出し */
  CASE
    WHEN i.trust_flag = 1 THEN '高信頼（改ざん検証済み）'
    WHEN i.danger_count > 0 THEN '注意（危険イベントあり）'
    WHEN i.risk_count > 0 THEN '注意（要因イベントあり）'
    ELSE '要確認'
  END AS headline_ja,

  /* ハイライト（その月のトップ reason） */
  COALESCE(
    (
      SELECT rc.title_ja
      FROM monthly_reason_rollups r
      LEFT JOIN reason_catalog rc ON rc.reason_code = r.reason_code
      WHERE r.user_id = i.user_id AND r.ym_jst = i.ym_jst
      ORDER BY r.cnt DESC
      LIMIT 1
    ),
    '特記事項なし'
  ) AS highlight_ja

FROM v_cia_institutional i;
