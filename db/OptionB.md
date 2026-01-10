# Option B: rollupに last_proof_id を書き込む（簡易・採用）

## 概要
monthly_rollups / daily_rollups の last_proof_id を、proof発行時に UPDATE で反映する。
イベント本体(heiankyo_events)には proof_id を必須で埋めない。

## Pros
- イベントUPDATE不要で軽い
- 実装が速い（MVP向き）

## Cons
- event単位でproof追跡したい場合に不足（必要なら後でAへ移行）
- 「このイベントはどのproofに含まれる？」の厳密性は弱い

## 運用
- proof作成後に rollup を該当期間だけ UPDATE
- UIは rollup + proofs を表示の中心にする
# Option B：マイグレーション標準寄り（中期で強い）

変更履歴を「順番＝真実」に寄せた構成。
運用が増えても破綻しにくい。D1の運用を正攻法に寄せたい場合向け。

## Directory

repo-root/
  app/
  worker/
    src/
    wrangler.toml
  db/
    migrations/
      0001_core.sql
      0002_rollups.sql
      0003_views_base.sql
      0004_reason_catalog.sql
      0005_rollup_tables.sql
      0006_cia_views.sql
      0007_patch_add_risk_count.sql
      0008_patch_add_bucket.sql
    jobs/
      rollup_refresh.sql
      backfill_day_ym.sql
    seeds/
      reason_catalog.seed.sql
    README.md
  scripts/
    migrate.ts              # migrations を順に適用
    seed.ts

## Rules

- `db/migrations/` は **追記のみ**（過去ファイルは編集しない）
- `jobs/` は運用ジョブ（rollup再計算、backfillなど）
- `seeds/` は初期データ投入（例：reason_catalog）
- READMEには「適用順」と「適用コマンド」を必ず明記

## When to choose

- テーブル/ビューが増え、変更頻度が上がってきた
- チーム化 or 今後チーム化する前提がある
- 監査/検証ロジックを「履歴込みで説明」したい
