---
name: "Connect info to Cloudflare Pages（パターン1固定）"
about: "CODEXFIXに渡す、info.luminabulige.com 接続の指示書テンプレ"
title: "✅ TASK: Connect info to Cloudflare Pages（パターン1固定）"
labels: ["infra", "docs", "cloudflare"]
assignees: []
---

## 背景 / Context
- 現在 app / api の配線が混戦しており、info を巻き込まないため info を独立配線する。
- 目的：info.luminabulige.com を Cloudflare Pages で安定ホスティングし、app/api のリダイレクトやルーティングと分離する。

## 対象レイヤ
- Docs layer（info/gate）

## リスクレベル
- M（影響あり / 要注意）
- 理由：本番ドメイン配線・誤誘導（ユーザー誤認）の可能性があるため。

## 方針（パターン1：推奨）
- [ ] Cloudflare Pages プロジェクトを info 専用で作る
- [ ] カスタムドメインを info.luminabulige.com に固定
- [ ] app/api 側のルールには触れない（混戦回避）

## 作業手順（Implementation Plan）

### 1. Pages プロジェクト作成
- [ ] Cloudflare Dashboard → Workers & Pages → Pages → Create project
- [ ] 接続方法はどちらでも可：
  - [ ] Git連携（推奨）：info 用の repo / branch を指定
  - [ ] Direct Upload：静的ファイル一式（フォルダ）をアップロード

### 2. ビルド設定（静的サイト）
- [ ] Build command：なし
- [ ] Output directory：
  - [ ] ルートに index.html がある → /
  - [ ] gate/index.html にある → gate
- [ ] index.html が入口であることを前提に、必ず直下に存在させる

### 3. カスタムドメイン接続
- [ ] Pages → Custom domains → info.luminabulige.com を追加
- [ ] Cloudflare DNS に必要レコードが出たらその通りに設定
- [ ] 既存の全域リダイレクトがある場合は “info を除外”（app/api ルールは触らない）

### 4. 誤認防止（Legal/UX）
- [ ] info は「教育/理解」導線であり、誘導や断定を避ける
- [ ] Proof/Verify の原則：
  - [ ] Proof = 改ざん検知であり真実性の主張ではない
  - [ ] Verify = 第三者検証UIであり判断主体ではない

## 受入条件 / DoD（検証方法つき）

✅ **動作確認（手元）**
- [ ] https://info.luminabulige.com/ が 200 で表示される
- [ ] https://info.luminabulige.com/literacy.html 等のサブページが表示される
- [ ] CSS/画像の参照切れがない（404が出ない）

✅ **CI/デプロイ確認（Cloudflare）**
- [ ] Pages の Production deploy が Success
- [ ] デプロイ後に info.luminabulige.com が Pages のプロジェクトに紐づいている（Custom domain で確認）

✅ **事故防止**
- [ ] app / api のルーティング・リダイレクトに影響を与えていない
- [ ] 既存 redirect ルールがある場合、info を例外化できている

✅ **ロールバック（切り戻し可能）**
- [ ] カスタムドメインを Pages から外す（即時退避）
- [ ] DNS を直前状態に戻す（記録必須）

## 安全チェック（該当するものは必ず）
- [ ] 「真実性」を主張する文言が混入していない（Proofは改ざん検知）
- [ ] Verify UI が判断主体に見える表現を避けた
- [ ] Secret / 鍵 / トークンがコミットされていない
- [ ] ログにPIIや機微情報を出していない
- [ ] ロールバック手順を書いた（切り戻し可能）
