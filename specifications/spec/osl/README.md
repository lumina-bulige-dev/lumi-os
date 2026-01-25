# OSL Policy Spec — README (Canonical)

OSL (OS LUMINABULIGE) は、プロジェクト横断の「できる/できない」を“人間の言語”で固定し、
運用・監査・比較（他社/他プロダクト）に耐える形で管理するための仕様です。

本ディレクトリは **OSLの正本（Single Source of Truth）** を置きます。
実装は別レイヤーに存在し得ますが、OSLの宣言・差分・根拠はここが唯一正です。

---

## 0. この仕様の位置づけ（上位宣言）

- Proof は **改ざん検知**（真実性を主張しない）
- Verify は **第三者検証のUI**（判断主体ではない）
- 断定しない／保証しない（合法性・正しさ・結果を約束しない）
- 判断・承認は **人間の意思決定のみ**（Admin/Control に集約）
- 将来の規制強化前提で設計する

---

## 1. Canonical Files（正本一覧）

- `spec/osl/osl.policy.v0.1.json`  
  - 機械可読。統制（controls）、施行（enforcement）、検証（tests）、証拠（evidence）を含む。
- `spec/osl/osl.policy.v0.1.md`  
  - 人間可読。法務/監査向けの説明版。
- `spec/osl/changelog.md`  
  - 差分の意図（Why）を短く残す（監査向け）。
- `spec/osl/README.md`（本書）  
  - 使い方・運用・DoD・変更手順。

---

## 2. OSLの基本構造（共通フォーマット）

OSL Policy JSON は原則として以下を持つ：

- `scope`：対象（host/path/zone 等）
- `controls[]`：統制単位（比較単位）
  - `intent`：目的（人間が読む）
  - `deny/allow`：禁止/許可
  - `enforcement`：施行層（waf/ui/csp/ci/worker/dns など）
  - `risk`：L/M/H（運用リスク）
  - `tests[]`：DoD/監査のための検査
  - `evidence`：設定ID/PR/ログなど“根拠ポインタ”
- `operations`：変更手順・DoD・ロールバック

---

## 3. 現行プロファイル（info_strict）

`info_strict` は `info.luminabulige.com` に対して以下を要求する：

### 3.1 INFO_NO_WRITE（Infoは読むだけ）
- deny: POST/PUT/PATCH/DELETE
- enforcement: WAF 等
- 目的：Infoを「説明専用」に固定し、誤誘導・誤操作・責任境界の崩壊を防ぐ

### 3.2 INFO_NO_EXTERNAL_NAV（外部遷移させない）
- deny: external links/forms/oauth login
- enforcement: UI + CSP
- 目的：GAFA➗1000 の運用（外部リンクは“クリック不可の文字表示”等）

---

## 4. DoD（運用受入条件）

### 4.1 ルート混線検査（毎回同じ3本）
- https://info.luminabulige.com/
- https://info.luminabulige.com/literacy.html
- https://info.luminabulige.com/jp/33-okayama/gate-info/summary.html

判定：
- 想定外の 301/302 が出ない
- 404 が出ない（CSS/画像等のアセット含む）
- info/gate から app/api に飛ばない（最重要）

### 4.2 書き込み拒否検査（例）
- `POST https://info.luminabulige.com/` が 403/405 で拒否される

---

## 5. 変更手順（Change Process）

### 5.1 変更経路（必須）
- 変更は **GitHub PR 経由のみ**
- main 直pushは禁止（Branch Protection）
- OSL関係ファイルは CODEOWNERS で承認必須（法務板）

### 5.2 versioning（必須）
- `osl_policy_version` または `policy_id` の version を上げる
- `changelog.md` に Why を1行で残す

---

## 6. ロールバック（Rollback）

- “最後に正常だった状態”へ戻せることは耐性の一部である
- Cloudflare Pages/Workers では「直前のデプロイへ戻す」導線を把握しておく
- 事故トリガ：
  - redirect 混線
  - external nav の混入
  - unexpected write の可能性

---

## 7. 比較（Comparability）

OSLは他社比較・ベンダー比較に耐えるよう、以下を共通比較軸とする：

- Write prevention（書き込み防止）
- External navigation suppression（外部遷移抑止）
- Auditability（変更追跡可能性）
- Rollback readiness（復旧可能性）

---

## 8. 用語（Glossary）

- Proof：改ざん検知（真実性ではない）
- Verify：第三者検証UI（判断主体ではない）
- Evidence：設定・PR・ログ等の根拠ポインタ（証拠そのものではなく“参照”）
- DoD：受入条件（固定手順で判定できること）
