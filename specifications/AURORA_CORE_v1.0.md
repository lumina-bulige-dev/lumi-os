🔔A-CORE / NOTICE
LUMI Canonical Header Policy v1.2

※本ファイルは A：HQ（Founder＋LUMI_A）のみ編集可。
B／C／D／E／F／G は参照のみとし、文言の引用・改変は禁止とする。

本ファイルは LUMI OS 正本（lumi-os/）の一部であり、
内容の改変・加筆・派生仕様の生成・PR 提案は A：HQ 以外のクラスには認められない。

If it is not in lumi-os, it is not official.

---

# AURORA_CORE_v1.0
（Aurora：送金比較コア構造定義）

## 0. Purpose
Aurora は「送金コストの見える化・教育用ツール」であり、
資金の移動を代行せず、預からず、投資判断を指示しない。

目的：
- ユーザーが「どのルートで送ると損が減るか」を理解できる
- 比較結果の前提（レート・手数料・日時）を明示し、誤認を避ける
- 外向けコピー（D）と UI（C）が Fintech 禁区を踏まえて安全に運用できる

## 1. Non-Goals（やらない）
- 送金の代理実行／入出金／資金の預かり
- FX・投機の推奨（買え／売れ／レバレッジ等）
- 「常にWise一択」等の断定

## 2. Architecture（構造）
Aurora は 3 層で構成する：

### 2.1 UI Layer（C：PRODUCT）
- 入力（送金額・通貨・条件）→ 結果表示
- “比較” をユーザーに提示するだけで、決定はユーザー

### 2.2 Data/Calc Layer（B：INFRA）
- 計算は API で行い、UI で再計算しない（整合性のため）
- レート・手数料の前提値をレスポンスに同梱する

### 2.3 Governance Layer（F：GOV）
- 表現・仕様が Fintech ラインを超えないかレビュー
- 3色（GREEN/YELLOW/RED）でAへ即フィードバック

## 3. Required Endpoints（最小API）
### 3.1 CTA Link API（必須）
- GET /api/v1/links/wise_affiliate
- Response: {"wise_url":"https://wise.com/invite/..."}
- 仕様：WISE_CTA_LINK_POLICY_v1.0 に完全準拠（ハードコード禁止）

### 3.2 Simulation API（任意：次フェーズ）
- GET /api/v1/aurora/simulate?amount=...&from=AUD&to=JPY
- Response（例）：
  {
    "from":"AUD",
    "to":"JPY",
    "amount_from":1000,
    "rate":98.25,
    "fee":7.50,
    "amount_to_est":97425,
    "assumptions":{
      "rate_type":"mid",
      "captured_at":"2025-12-12T00:00:00Z",
      "fee_type":"estimated"
    }
  }

## 4. Output Rules（表示ルール）
- 「最安」断定は禁止（条件付き比較のみ）
- 前提（captured_at / rate_type / fee_type）を必ず表示
- 誇大表現（必ず得・ノーリスク）禁止

## 5. Adoption（採択条件）
- /api/v1/links/wise_affiliate が実装され、LP/アプリが参照できる
- D の LP から URL 直書きが消えている
- F が「比較ツールの範囲」として GREEN 判定
