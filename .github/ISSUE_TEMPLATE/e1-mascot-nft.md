---
name: "E1: マスコットNFT（非譲渡/insight-only）× Proof 紐付け"
about: "非譲渡のマスコットNFTをProofと紐付ける"
title: "E1: マスコットNFT（非譲渡/insight-only）をProofと紐付け—行動継続と「ユーザー歴史」"
labels: ["nft:non-transferable", "type:feature"]
assignees: []
---

# E1: マスコットNFT（非譲渡/insight-only）をProofと紐付け—行動継続と「ユーザー歴史」

## 担当
- @TBD

## 期日
- YYYY-MM-DD

## 前提（ポリシー）
- NFTは譲渡不可（SBT準拠/社内インサイトのみ）
- 取引・投機目的ではなく、イベント証跡目的。金融商品化しない
- 文言は勧誘/与信示唆を禁止（「あなたの継続の記録です」）

## やること
- NFTメタデータ（例）

```json
{
  "type":"mascot_badge",
  "non_transferable":true,
  "scope":"insight-only",
  "proof_id":"proof:...",
  "event_tags":["save_streak","no_redzone_30d"],
  "emotion":["calm","proud"],
  "issued_at":"ISO-UTC",
  "art_ref":"mascots/v2/xxx.png"
}
```

- 発行条件：Proof/指標に基づく（例：save_streak_30）
- 非譲渡を強制（移転Tx拒否／送信UIなし）
- 画像アセット：版管理・権利表示・利用範囲=社内/個人閲覧

## DoD
- 達成イベント→**NFT（非譲渡）**発行、Proof ID と相互参照OK
- ウォレットUIは表示専用（送信ボタンなし）
- 規約に 「譲渡不可／金銭的価値の主張無し」 を明記
