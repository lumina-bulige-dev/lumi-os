# Option C: rollupを持たず毎回集計（非推奨）

## 概要
毎回 heiankyo_events を GROUP BY して KPI を生成（VIEWで重くなる）。

## Pros
- データ冗長が少ない

## Cons
- 読み取りが重い（UIが遅くなる）
- スケールしない
# Option C：最強だが重い（チーム化前提）

DB・API・レポート生成を明確分離する構成。
設計としては強いが、今のフェーズ（1人・速度優先）だと管理コストが増える。

## Directory

repo-root/
  packages/
    db/                     # schema/migrations/jobs/seeds をここに集約
    shared/                 # 共通型・ユーティリティ（型/計算/検証）
  apps/
    web/                    # Next.js
    worker/                 # API/cron/署名検証/rollup実行

## Rules

- DB資産は `packages/db` に集約し、アプリ側は参照するだけにする
- `shared` に「判定」「スコア」「表示文言化」等を切り出し再利用性を上げる
- CIで migration / seed / lint / typecheck を回して統制する

## When to choose

- 複数アプリ（web / admin / worker）が増えてきた
- 仕様が安定し、再利用コードが増えてきた
- チームで責務分離（DB担当・API担当・UI担当）を回したい
