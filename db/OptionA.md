# Option A：最小・現実解（今すぐ回る）

Cloudflare縛り（Pages / Workers / D1）で、まず「回る」ことを最優先にした構成。
DBスキーマを固定しつつ、更新SQL（rollup）やALTERパッチも同居できる。

## Directory

repo-root/
  app/                     # Next.js (Cloudflare Pages: next-on-pages)
  functions/               # Pages Functions / API（使っている場合）
    api/
  worker/                  # 署名/検証/rollup実行など（本体Workerがある場合）
    src/
    wrangler.toml
  db/
    schema/
      001_core.sql
      002_rollups.sql
      003_views_base.sql
      004_reason_catalog.sql
      005_rollup_refresh.sql
      006_cia_views.sql
    patches/               # 既存DBに当てるALTER等（事故った時の保険）
      2025-12-xx_add_risk_count.sql
      2025-12-xx_add_bucket_to_mrr.sql
    README.md              # 「どれをどの順番で流すか」だけを書く
  scripts/
    apply-db-local.ts       # （任意）ローカル/CI用 wrangler d1 execute 呼び出し
    refresh-rollups.ts      # （任意）rollup再計算を叩く
  docs/
    CIA.md
    DB_RULES.md

## Rules

- `db/schema/` は **不変（原則編集しない）**
  - 変更が必要になったら `db/patches/` に **追記**する
- `schema`（定義） と `rollup_refresh`（ジョブ）を分離する  
  - ジョブSQLは `005_rollup_refresh.sql` のようにまとめ、運用で叩く
- コメントは `/* */` を推奨（D1 Consoleでの `--` 事故を回避）

## When to choose

- 1人開発でスピード優先
- “今すぐ回す” を最優先
- 後からOptionBへ移行しても痛手が少ない
