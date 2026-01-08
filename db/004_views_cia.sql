/* ===== Institutional (Appendix) ===== */
CREATE VIEW IF NOT EXISTS v_cia_institutional AS
SELECT
  k.user_id,
  k.ym_jst,

  k.safe_rate_raw_x1e4 AS raw_x1e4,
  k.safe_rate_cap_x1e4 AS cap_x1e4,
  k.safe_rate_pct,

  /* a && b */
  CASE
    WHEN k.safe_rate_cap_x1e4 >= 980000 AND k.danger_count = 0 AND k.risk_count = 0 THEN 1
    ELSE 0
  END AS trust_flag,

  /* c (strength_score): integer-only, no log/round dependency */
  (
    /* months with data */
    10 * (SELECT COUNT(*) FROM monthly_rollups m2 WHERE m2.user_id = k.user_id AND m2.total_count > 0)
    +
    /* volume tier bonus */
    CASE
      WHEN k.total_count >= 1000 THEN 50
      WHEN k.total_count >= 300  THEN 40
      WHEN k.total_count >= 100  THEN 30
      WHEN k.total_count >= 30   THEN 20
      WHEN k.total_count >= 10   THEN 10
      ELSE 0
    END
    +
    /* safety bonus */
    CASE
      WHEN k.danger_count = 0 THEN 10 ELSE 0
    END
  ) AS strength_score,

  /* institutional_score: “銀行が好きな点数”用（雑に強い） */
  (
    100
    + (CASE WHEN k.safe_rate_cap_x1e4 >= 999000 THEN 50 ELSE 0 END)
    + (CASE WHEN k.danger_count = 0 THEN 10 ELSE 0 END)
    + (CASE WHEN k.risk_count   = 0 THEN 3  ELSE 0 END)
    + (10 * (SELECT COUNT(*) FROM monthly_rollups m2 WHERE m2.user_id = k.user_id AND m2.total_count > 0))
  ) AS institutional_score,

  k.total_count,
  k.danger_count,
  k.risk_count,
  k.last_proof_id

FROM v_monthly_kpis k;

/* ===== Customer (Report) ===== */
CREATE VIEW IF NOT EXISTS v_cia_customer AS
SELECT
  i.user_id,
  i.ym_jst,

  /* Headlines */
  CASE
    WHEN i.trust_flag = 1 THEN '改ざん検証済み・高信頼'
    WHEN i.cap_x1e4 >= 980000 THEN '概ね良好（改善余地あり）'
    ELSE '注意（要確認）'
  END AS headline_ja,

  CASE
    WHEN i.trust_flag = 1 THEN 'この月の記録は改ざん検証に通過し、監査参照可能です。'
    WHEN i.danger_count > 0 THEN '危険判定が含まれます。明細を確認してください。'
    WHEN i.risk_count > 0 THEN '疑義フラグが含まれます（反社/名寄せ/送金など）。'
    ELSE '記録はありますが、検証強度を上げる余地があります。'
  END AS highlight_ja,

  i.safe_rate_pct,
  i.trust_flag,
  i.institutional_score,
  i.total_count,
  i.danger_count,
  i.risk_count,
  i.last_proof_id

FROM v_cia_institutional i;
