---
name: "D1: Proof/Verify 連携（閲覧専用）"
about: "Proof/Verify 連携の閲覧専用UIと検証ロジック"
title: "D1: Proof/Verify 連携（改ざん検知の閲覧のみ／Publicは書込み禁止）"
labels: ["type:security", "policy:read-only"]
assignees: []
---

# D1: Proof/Verify 連携（改ざん検知の閲覧のみ／Publicは書込み禁止）

## 担当
- @TBD

## 期日
- YYYY-MM-DD

## やること
- Proof サイン：Workers or API（Ed25519/JWS、RFC8785-JCS）
- KV連鎖（prev_hash と日次アンカー）
- Verify UI：検証結果の表示のみ（レポート/共有画面からリンク）
- Public層は書込み禁止。書込みはサーバ側のみ。

## DoD
- Verifyでトークン検証→一致/不一致を表示（閲覧のみ）
