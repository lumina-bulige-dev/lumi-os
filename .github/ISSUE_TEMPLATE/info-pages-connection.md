---
name: "Info (法務/Docs/Verify) Pages 接続"
about: "info サブドメインを Cloudflare Pages に安全接続する指示書"
title: "[INFO] Cloudflare Pages 接続（info.luminabulige.com）"
labels: ["infra", "docs", "cloudflare"]
assignees: []
---

## 目的
- info を公式の説明・線引き・Verify/Proof・法務Docs の本丸として公開する。
- app / api の既存配線に影響を与えない。
- “Proof=改ざん検知（真実性ではない） / Verify=第三者検証UI（判断主体ではない）” の原則を全ページで崩さない。

## スコープ
- [ ] info.* サブドメイン（または luminabulige.info ルート）のみを Cloudflare Pages に接続
- [ ] Pages のデプロイ手段を安定化（推奨：Git 連携）
- [ ] 404/真っ白の原因（index.html 不在、階層ズレ、リンク切れ）を除去

## 対象外
- [ ] app.* / api.* の DNS / ルーティング / Redirect / Workers 設定を変更しない
- [ ] API ドメインに静的ページを同居させない
- [ ] “安全/保証/認定”など断定に見える表現は増やさない

## 前提条件
- [ ] Cloudflare 上で対象ゾーン（例：luminabulige.com or luminabulige.info）の DNS を管理している
- [ ] info 用の Pages プロジェクトが存在する
- [ ] 静的アセットがルート直下に揃っている
  - [ ] index.html（必須）
  - [ ] styles.css（任意だが推奨）
  - [ ] terms.html / privacy.html / disclaimer.html
  - [ ] proof.html / verify.html
  - [ ] （任意）changelog.html

> ⚠️ index.html がルート直下にないと、/ が表示されない（404/真っ白になりやすい）

## 実施手順

### Step A：Pages デプロイ方式を確定（推奨：Git 連携）
- [ ] Cloudflare Dashboard → Workers & Pages → 対象 Pages プロジェクトを開く
- [ ] Settings → Builds & deployments を確認
- [ ] 以下に統一（静的HTML想定）
  - [ ] Framework preset：None
  - [ ] Build command：なし/空
  - [ ] Output directory：/（ルート）または空
- [ ] Git integration を有効化（推奨）
  - [ ] 対象 repo を接続
  - [ ] main ブランチ push → 自動デプロイ
- [ ] pages.dev ドメインで index が表示される

### Step B：Custom Domain を “info だけ” 追加
**パターン1（推奨）：info.luminabulige.com**
- [ ] Custom domains → Add custom domain
- [ ] info.luminabulige.com を追加
- [ ] CNAME: info → <project>.pages.dev

**パターン2：luminabulige.info**
- [ ] Custom domains に luminabulige.info を追加
- [ ] 指示に従い CNAME 相当で向ける

### Step C：Redirect / Rule の吸い込み事故を防ぐ
- [ ] Redirect Rules / Page Rules を点検
- [ ] info を全吸い込みから除外
  - [ ] IF hostname is info.luminabulige.com THEN no redirect
  - [ ] IF hostname is api.luminabulige.com THEN no redirect
  - [ ] ELSE redirect to app（必要なら）

> 変更は “info 除外” だけに限定

## 検証
**V1：表示**
- [ ] https://info.luminabulige.com/ が index.html を返す
- [ ] https://info.luminabulige.com/index.html でも表示できる
- [ ] styles.css が当たって崩れてない

**V2：導線**
- [ ] index → terms/privacy/disclaimer/proof/verify に 404 がない
- [ ] 相対パスが崩れていない

**V3：誤認防止**
- [ ] Proof：改ざん検知であり 真実性を主張しない
- [ ] Verify：第三者検証のUIであり 判断主体ではない
- [ ] 「保証」「認定」「確実」「必ず」など断定表現が本文にない（ある場合は否定形に修正）

## ロールバック
- [ ] Pages → Deployments から前回の成功デプロイへ戻せる
- [ ] DNS 変更を戻す場合の手順を明記
  - [ ] info の CNAME を旧値へ戻す（または削除）
- [ ] Redirect 変更がある場合は差分メモを残す

## DoD
- [ ] info のカスタムドメインが Pages に接続済み（SSL 有効）
- [ ] https://info.../ で index.html が表示される
- [ ] 主要リンクが全て生きている（404ゼロ）
- [ ] Proof/Verify の原則文言がトップ〜各ページで確認できる
- [ ] app/api の DNS / Redirect / Workers に影響が出ていない

## 非機能（Safety）
- [ ] Secrets/鍵/トークンを repo に入れていない（コミットも含む）
- [ ] PII をログ/ページで収集しない

## 補足
- 「Assetsを1個ずつアップ」運用は事故りやすいため、基本は Git 連携を推奨
- index.html は完全HTML（doctype/head/body）で統一
