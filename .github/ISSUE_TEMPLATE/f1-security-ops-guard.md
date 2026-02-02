---
name: "F1: セキュリティ/運用ガード"
about: "KillSwitch・監査ログ・依存固定などの運用ガード"
title: "F1: セキュリティ/運用ガード（KillSwitch・Flag・監査ログ・依存固定）"
labels: ["type:security"]
assignees: []
---

# F1: セキュリティ/運用ガード（KillSwitch・Flag・監査ログ・依存固定）

## 担当
- @TBD

## 期日
- YYYY-MM-DD

## やること
- Kill Switch (#B2)
- 依存固定（lockfile commit、脆弱性アラート通知）
- 監査ログ：API/決裁/Flag変更は D1 に誰が/何を/いつ
- バインディング（KV/D1/R2）は環境別分離
- 秘密鍵は Secrets／ローテ方針ドキュメント化

## DoD
- クリティカル操作は即停止でき、操作主体を追跡可能
