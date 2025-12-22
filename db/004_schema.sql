/* db/004_schema.sql */
/* B運用: proofs発行後に monthly_rollups.last_proof_id を埋める + 監査ログ */

PRAGMA foreign_keys = ON;

/* =========================================
   1) Proof range helper view
   - proof_id から (user_id, range_from, range_to, ym_from, ym_to) を引ける
========================================= */
DROP VIEW IF EXISTS v_proof_range;

CREATE VIEW v_proof_range AS
SELECT
  proof_id,
  user_id,
  range_from,
  range_to,
  substr(range_from, 1, 7) AS ym_from,
  substr(range_to,   1, 7) AS ym_to,
  created_at_ts,
  ruleset_version,
  payload_hash_b64u,
  kid,
  alg,
  sig_ts,
  status
FROM proofs;

/* =========================================
   2) Proof apply log (audit)
   - B運用で last_proof_id を埋めた履歴を残す
========================================= */
CREATE TABLE IF NOT EXISTS proof_apply_logs (
  apply_id      TEXT PRIMARY KEY,
  proof_id      TEXT NOT NULL,
  user_id       TEXT NOT NULL,
  ym_from       TEXT NOT NULL,         /* 'YYYY-MM' */
  ym_to         TEXT NOT NULL,         /* 'YYYY-MM' */
  updated_rows  INTEGER NOT NULL DEFAULT 0,
  mode          TEXT NOT NULL DEFAULT 'B_MONTHLY_LAST_PROOF', /* 運用種別 */
  note          TEXT,
  created_at_ts INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_proof_apply_user_time
  ON proof_apply_logs(user_id, created_at_ts DESC);

CREATE INDEX IF NOT EXISTS idx_proof_apply_proof
  ON proof_apply_logs(proof_id, created_at_ts DESC);

/* =========================================
   3) Safety view: monthly_rollups coverage check
   - proof が対象とする月が rollups に存在するか確認できる
========================================= */
DROP VIEW IF EXISTS v_proof_monthly_coverage;

CREATE VIEW v_proof_monthly_coverage AS
SELECT
  pr.proof_id,
  pr.user_id,
  pr.ym_from,
  pr.ym_to,
  mr.ym_jst,
  CASE WHEN mr.user_id IS NULL THEN 0 ELSE 1 END AS has_monthly_rollup
FROM v_proof_range pr
LEFT JOIN monthly_rollups mr
  ON mr.user_id = pr.user_id
 AND mr.ym_jst >= pr.ym_from
 AND mr.ym_jst <= pr.ym_to;

/* =========================================
   4) B運用: 実行SQLテンプレ（Workerで prepared statement）
   - D1コンソールで ? バインドは動かない/事故りやすいので
     Worker側で必ず .bind(proofId, userId) して使う前提。
========================================= */
/*
(Worker) 1) proof range を取る
SELECT ym_from, ym_to FROM v_proof_range WHERE proof_id=? AND user_id=?;

(Worker) 2) monthly_rollups の last_proof_id を埋める（範囲内だけ）
UPDATE monthly_rollups
SET last_proof_id = ?
WHERE user_id = ?
  AND ym_jst >= ?
  AND ym_jst <= ?;

(Worker) 3) 何行更新したかを取る（changes()）
SELECT changes() AS updated_rows;

(Worker) 4) 監査ログを残す
INSERT INTO proof_apply_logs (
  apply_id, proof_id, user_id, ym_from, ym_to, updated_rows, mode, note, created_at_ts
) VALUES (?, ?, ?, ?, ?, ?, 'B_MONTHLY_LAST_PROOF', ?, ?);
*/

/* =========================================
   5) 推奨インデックス（B運用のUPDATEを速くする）
========================================= */
CREATE INDEX IF NOT EXISTS idx_monthly_user_ym
  ON monthly_rollups(user_id, ym_jst);

CREATE INDEX IF NOT EXISTS idx_proofs_user_range
  ON proofs(user_id, range_from, range_to);
