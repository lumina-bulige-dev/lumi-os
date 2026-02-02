---
name: "A2: Pages ビルドログ自動保存＆再現手順整備"
about: "Pages ビルドログの保存とローカル再現手順を整備"
title: "A2: Pages ビルドログ自動保存＆再現手順整備"
labels: ["area:public", "type:build"]
assignees: []
---

# A2: Pages ビルドログ自動保存＆再現手順整備

## 担当
- @TBD

## 期日
- YYYY-MM-DD

## やること
- CIで Pages ビルドログをArtifacts保存
- 失敗時：エラー行の前後200行を出力
- READMEにローカル再現手順（`npm ci && npm run pages:build`）記載

## DoD
- 失敗時に完全ログ取得／再現手順が動作
