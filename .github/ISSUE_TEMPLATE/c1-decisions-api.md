---
name: "C1: Decisions API + D1 台帳"
about: "Decisions APIの実装とD1永続化"
title: "C1: Decisions API（approve/latest/list）＋D1 永続化"
labels: ["type:api"]
assignees: []
---

# C1: Decisions API（approve/latest/list）＋D1 永続化

## 担当
- @TBD

## 期日
- YYYY-MM-DD

## やること
- D1 テーブル：decisions, decision_latest
- API
  - POST /api/decisions/approve：payload検証→D1追記→latest更新
  - GET /api/decisions/latest / list：参照
- Zod スキーマ、管理者ガード

## DoD
- approve で追記→latest 更新が確認できる
- 自動承認ロジックが存在しない
