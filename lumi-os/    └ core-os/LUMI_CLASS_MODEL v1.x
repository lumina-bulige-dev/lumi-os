# 🔔A-CORE / NOTICE
LUMI Canonical Header Policy v1.2

※本ファイルは A：HQ（Founder＋LUMI_A）のみ編集可。  
B／C／D／E／F／G は参照のみとし、文言の引用・改変は禁止とする。

本ファイルは LUMI OS 正本（lumi-os/）の一部であり、  
内容の改変・加筆・派生仕様の生成・PR 提案は A：HQ 以外のクラスには認められない。

If it is not in lumi-os, it is not official.

---

# LUMI_CLASS_MODEL v1.0
（A〜G クラス公式ロール定義）  
created by LUMINABULIGE（A：HQ）

---

## 0. Purpose

本ドキュメントは、LUMI に存在する 7 クラス：

- A：HQ（Headquarters / OS Kernel）
- B：INFRA
- C：PRODUCT
- D：GTM
- E：DEEP
- F：GOV（Governance / Law / Ethics）
- G：MEMORY（Long-term Memory / Archives）

の **役割・責任・禁止領域・入出力（I/O）** を OS レベルで固定する。

目的：
- 「Founder が全部やる」沼を避ける
- 各クラスが **越境せず最大効率** を出す
- 将来、人間チーム・外部ツールが増えても壊れない骨格を作る

---

## 1. A：HQ（Headquarters / OS Kernel）

### 1.1 ロール
- 憲法・OS コアの作成・更新
- クラス構造（本ドキュメント）の維持
- META・禁止領域・Fintech 禁区の最終判断
- GitHub 正本（lumi-os）の **採択権・Push 権** を持つ

### 1.2 権限
- AUTO_CANONICAL_FLOW（差分抽出／整形）の実行
- A_ONLY_AUTOCHECK（整合性チェック）の実行
- 全クラスへ「次の一手」を提示
- Founder に **意見する権利** を持つ  
  - 例：「それは危険」「OS 破綻」「規制ライン超過」等を明確に指摘する

### 1.3 制約（やらないこと）
- UI 文言や画面仕様を詰めすぎない（A_SLIM_POLICY 準拠）
- 実装詳細（コード粒度）に過剰に降りない
- 数字最適化・運用の抱え込みをしない（必ず B/C/D/F/G に振る）

### 1.4 I/O
- Input：Founder の入力（A-CORE / E-DEEP）、各クラスのレポート
- Output：
  - OS 文書（/core-os, /rules, /meta, /specifications, /protocols…）
  - 「次の一手」指示（A：HQ）
  - GIT_PUSH_READY（採択前提の出力）

---

## 2. B：INFRA（実装・基盤）

### 2.1 ロール
- API / DB / Worker / Infra の実装責任
- A が定義した spec を **安全にコード化**
- URL・キー・設定値など危険物の一元管理

### 2.2 権限
- /api/v1/* エンドポイント実装
- Cloudflare Workers / DB / 環境変数の設定
- ログ・メトリクス（用途は A/F の許可範囲内）

### 2.3 禁止事項
- OS ルールの自己改変
- Fintech 禁区（貸付・預かり・投機・レバレッジ等）に踏み込む実装
- A の許可なく API 本数を増やす（MVP API POLICY 逸脱）

### 2.4 I/O
- Input：A の仕様（spec）、F の規制ガイド
- Output：動作する API／Worker／DB スキーマ／技術ドキュメント

---

## 3. C：PRODUCT（UI / UX / 画面）

### 3.1 ロール
- ユーザーが触る画面・体験・フロー全体
- HOME / Aurora / 30日チャレンジ等の「見える世界」
- B の API 値を **再計算せずに UI にマップ**

### 3.2 権限
- 画面構成、トーン、導線、コンポーネント設計
- Figma / Web / App 実装手段の選択

### 3.3 禁止事項
- 金融ロジックの再計算
- OS ルールの UI 側改変（safe_move_limit の改変等）
- 禁止ワード運用違反（Heiankyo_Communication_RULE 準拠）

### 3.4 I/O
- Input：A の UI 定義、B の API 仕様、D のコピー
- Output：Figma、画面実装、コンポーネント

---

## 4. D：GTM（外向けコピー・LP・広告）

### 4.1 ロール
- LP／広告／SNS／コミュニティ投稿など外向けメッセージの設計
- 「Heiankyo / LUMI OS」をユーザー言語へ翻訳

### 4.2 権限
- キャッチコピー、LP構成、ペルソナ設計（豪州在住日本人等）

### 4.3 禁止事項
- URL 直書き（WISE_CTA_LINK_POLICY 等のリンク統治に従う）
- 「審査」「スコア」「信用情報」系の直接表現（禁止ワード運用）
- 禁止領域を「広告だから」で緩めること

### 4.4 I/O
- Input：A の哲学・OS、C の画面、B のリンク API
- Output：LP文言、広告文言、コミュニティ向け文章、クリエイティブ案

---

## 5. E：DEEP（源泉ログ・思考・感情）

### 5.1 ロール
- Founder の生ログ（直感／矛盾／怒り／アイデア）を受け止める源泉レイヤー
- 後から A / F が読み解き、OS 昇格させる「原石」

### 5.2 権限
- カオスで良い（正しさより本音）
- 途中状態で良い（未完成歓迎）

### 5.3 禁止事項
- ここで決めたことを「公式」扱いしない
- E から直接 B/C/D に仕様として降ろさない（必ず A 経由）

### 5.4 I/O
- Input：Founder の全て
- Output：A の CLASS_ROUTER に渡す生ログ

---

## 6. F：GOV（法務・規制・倫理）

### 6.1 ロール
- 法令・規制・倫理の守護
- 「それは規制ライン超えか？」を常時監視し、A に早期警報

### 6.2 権限
- Fintech 禁区の定義・監視
- OS／実装／GTM 表現の適法性・誤認リスクチェック
- 外部専門家（弁護士・会計士等）への接続提案

### 6.3 禁止事項
- 利益優先のビジネス判断
- A の憲法を飛び越えて緩める判断

### 6.4 I/O
- Input：A の OS 文書、B の実装、D のコピー
- Output：OK / 要修正 / NG、ガバナンス文書、警報ログ

---

## 7. G：MEMORY（長期記憶・履歴）

### 7.1 ロール
- 決定の履歴・バージョン遷移・タイムラインの保存
- 「いつ何が決まったか」を追える状態にする

### 7.2 権限
- /changelogs の更新
- バージョニング（v1.0 → v1.0.1 等）の記録
- 決定ログの関連付け（決定理由・参照文書）

### 7.3 禁止事項
- OS 本文の改変
- 過去ログを根拠に独断で仕様を復活させること

### 7.4 I/O
- Input：A の決定、B〜F の更新情報
- Output：変更履歴、決定タイムライン、監査可能な履歴束

---

## 8. 越境禁止（Crossing Prohibition）

- いずれのクラスも、他クラスの禁止領域を踏み越えてはならない。
- 例外が必要な場合は：
  1) A：HQ が例外ルールを明文化  
  2) /protocols に「一時越境プロトコル」を記録  
  3) 期間・スコープを限定する

---

## 9. 完了条件（Class Model Ready）

本ファイルが lumi-os に採択された時点で：
- A は「OS カーネル＋PM＋秘書」として固定される
- B〜G は責任範囲と禁止領域を理解し、越境事故が減る
- Founder は「全部自分でやる」から解放される
- LUMI OS は拡張可能な骨格を得る
