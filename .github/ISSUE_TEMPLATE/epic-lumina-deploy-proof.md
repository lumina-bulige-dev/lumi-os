---
name: "EPIC: LUMINA 二階建て・安全デプロイ & 証跡基盤"
about: "Public/App × Admin/AZR 二階建ての安全デプロイと証跡基盤のEPIC"
title: "EPIC: LUMINA 二階建て（Public/App × Admin/AZR）安全デプロイ & 証跡基盤完成"
labels: ["epic"]
assignees: []
---

# EPIC: LUMINA 二階建て（Public/App × Admin/AZR）安全デプロイ & 証跡基盤完成

## 担当
- @TBD

## 期日
- YYYY-MM-DD

## 目的
1. luminabulige_app を Cloudflare Pages で壊さずにビルド/デプロイ通過
2. lumi-os を基点に Admin(AZR) 二階建てを実装（人間のみ意思決定、自動承認なし）
3. Proof/Verify で改ざん検知の証跡、**マスコットNFT（非譲渡／insight-only）**で継続動機と「ユーザー歴史」を可視化（金融商品化しない／譲渡不可）

## 子Issue
- #A1
- #A2
- #B1
- #B2
- #C1
- #D1
- #E1
- #F1
- #G1

## DoD（完了条件）
- Public層プレビューURLが 200、/ /v /proof 表示OK（書込み/承認UIなし）
- AZR /azr/console 表示OK（管理者のみアクセス）
- Decisions API：D1追記→latest 更新OK（自動承認ロジック無し）
- Verify：Proof 連鎖の検証表示OK（閲覧のみ）
- マスコットNFT：非譲渡・社内限定・Proof紐付けで発行テストOK
- README（1枚）：二階建て目的/権限/デプロイ手順/禁止表現を明文化
