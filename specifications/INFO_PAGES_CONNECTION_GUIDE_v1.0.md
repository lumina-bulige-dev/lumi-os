# CODEXFIX 指示書：Info（法務/Docs/Verify）を Cloudflare Pages に接続

## 0. 目的
- info を公式の説明・線引き・Verify/Proof・法務Docs の本丸として公開する。
- app / api の既存配線に影響を与えない（混戦を悪化させない）。
- “Proof=改ざん検知（真実性ではない） / Verify=第三者検証UI（判断主体ではない）” の原則を全ページで崩さない。

## 1. スコープ

**対象（やる）**
- info.* サブドメイン（または luminabulige.info ルート）のみを Cloudflare Pages に接続
- Pages のデプロイ手段を安定化（推奨：Git 連携）
- 404/真っ白の原因（index.html 不在、階層ズレ、リンク切れ）を除去

**対象外（やらない）**
- app.* / api.* の DNS / ルーティング / Redirect / Workers 設定を変更しない
- API ドメインに静的ページを同居させない
- “安全/保証/認定”など断定に見える表現は増やさない

## 2. 前提条件（Preconditions）
- Cloudflare 上で対象ゾーン（例：luminabulige.com or luminabulige.info）の DNS を管理していること
- info 用の Pages プロジェクトが存在すること
  - 例：luminabulige-info / luminabulige-legal / LUMINAINFO など
- 静的アセットが以下のようにルート直下に揃っていること
  - index.html（必須）
  - styles.css（任意だが推奨）
  - terms.html / privacy.html / disclaimer.html
  - proof.html / verify.html
  - （任意）changelog.html

> ⚠️ index.html がルート直下にないと、/ が表示されない（404/真っ白になりやすい）

## 3. 実施手順（Step-by-step）

### Step A：Pages デプロイ方式を確定（推奨：Git 連携）
1. Cloudflare Dashboard → Workers & Pages → 対象 Pages プロジェクトを開く
2. Settings → Builds & deployments を確認
3. デプロイ方式を以下に統一（静的HTML想定）
   - Framework preset：None
   - Build command：なし/空
   - Output directory：/（ルート）または空（UI仕様に合わせる）
4. 可能なら Git integration を有効化（推奨）
   - 対象 repo を接続（例：lumi-legal-docs / luminabulige-legal-docs 等）
   - main ブランチ push → 自動デプロイされる状態にする

✅ ここで「pages.dev ドメイン」上で表示できることを先に確認する
（例：<project>.pages.dev が index を返す）

### Step B：Custom Domain を “info だけ” 追加

混戦止血のため、info 以外のドメインは触らない。

**パターン1（推奨）：info.luminabulige.com**
1. Pages プロジェクト → Custom domains → Add custom domain
2. info.luminabulige.com を追加
3. Cloudflare が提示する DNS レコードを作成（基本は CNAME）
   - info → <project>.pages.dev（CNAME）

**パターン2：luminabulige.info（ルートを表舞台にする）**
1. Pages → Custom domains に luminabulige.info を追加
2. DNS は Cloudflare が CNAME flatten 等で処理するケースが多い
   - 指示に従い、A/AAAA ではなく CNAME 相当で向ける

### Step C：Redirect / Rule の吸い込み事故を防ぐ（最重要）

混戦がある時、強いリダイレクトが info を app に吸い込みがち。
1. Cloudflare の Redirect Rules / Page Rules を点検
2. 以下があれば info を除外する
   - *luminabulige.com/* → app.luminabulige.com/* のような強い全吸い込み
3. “除外条件”の例（概念）
   - IF hostname is info.luminabulige.com THEN no redirect
   - IF hostname is api.luminabulige.com THEN no redirect
   - ELSE redirect to app（必要なら）

ここを触る場合はリスクが上がるので、変更は “info 除外” だけに限定。

## 4. 検証（Verification）

**V1：表示**
- https://info.luminabulige.com/ が index.html を返す
- https://info.luminabulige.com/index.html でも表示できる（保険）
- styles.css が当たって崩れてない（軽微な崩れはM範囲で許容）

**V2：導線（リンク）**
- index → terms/privacy/disclaimer/proof/verify に 404 がない
- 相対パスが崩れていない（./proof.html 等が解決する）

**V3：誤認防止（内容）**
- Proof：改ざん検知であり 真実性を主張しない
- Verify：第三者検証のUIであり 判断主体ではない
- 「保証」「認定」「確実」「必ず」などの断定が本文にない
  - （ある場合は “保証しない” の否定形に修正）

## 5. ロールバック（Rollback Plan）
- Pages → Deployments から “前回の成功デプロイ” に戻せること
- DNS 変更を戻す場合の手順を明記
  - info の CNAME を旧値へ戻す（または削除）
- Redirect 変更を行った場合は必ず差分メモを残す（復旧のため）

## 6. リスクレベル
- M（Medium）

理由：法務/Verify/誤認防止の表現と導線に関わるため。app/api の配線に触れない限り、Hにはしない。

## 7. DoD（Definition of Done）

✅ **完了条件（Must）**
1. info のカスタムドメインが Pages に接続済み（SSL 有効）
2. https://info.../ で index.html が表示される
3. index → proof/verify/terms/privacy/disclaimer の主要リンクが全て生きている（404ゼロ）
4. Proof/Verify の原則文言がトップ〜各ページで確認できる（少なくともフッター固定 or 冒頭）
5. app/api の DNS / Redirect / Workers に影響が出ていない（挙動変化なし）

✅ **検証方法（How to verify）**
- ブラウザで上記URLを開いて確認
- Cloudflare Pages の “Custom domains” が Active / SSL OK
- Deployments に “Success” があり、ロールバック可能であることを確認

✅ **非機能（Safety）**
- Secrets/鍵/トークンを repo に入れていない（コミットも含む）
- PII をログ/ページで収集しない（問い合わせフォーム等はまだ置かない）

## 8. 追加メモ（CODEXFIX向けの注意）
- 「Assetsを1個ずつアップ」運用は事故りやすいため、基本は Git 連携を推奨
- index.html が “断片HTML” だと白画面になり得るので、必ず完全HTML（doctype/head/body）で統一
