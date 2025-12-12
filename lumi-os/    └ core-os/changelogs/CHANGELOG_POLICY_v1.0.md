🔔A-CORE / NOTICE
CHANGELOG_POLICY_v1.0

※本ファイルは A：HQ（Founder＋LUMI_A）のみ編集可。
B／C／D／E／F／G は参照のみとし、文言の引用・改変は禁止とする。

If it is not in lumi-os, it is not official.

---

# CHANGELOG_POLICY v1.0
（LUMI OS 変更履歴の運用ルール）

## 0. Purpose
/changelogs の役割を固定し、LUMI OS の「いつ・何が・誰により採択されたか」を
迷子にならず追跡できる状態にする。

## 1. Canonical Rule（絶対ルール）
/changelogs に書いてよいのは、次の3種類のみ：

1) Adopted（採択）
- OS 文書・ルール・プロトコルが「正本として採択」された記録

2) Mode Change（モード遷移）
- PRIVATE_BOOT_MODE の ON/OFF
- 公開状態の切替（Private / Limited / Public）

3) Bootstrap / Kernel Milestone（節目）
- BOOTSTRAP FINISHED 等のカーネル節目
- OS 構造の重要な初期化イベント

※議論・理由・雑談・感情ログは /changelogs に入れない（E または PRIVATE_KERNEL_LOG 側）。

## 2. Formats（記載フォーマット）
各エントリは最低限これを含む：

- Date: YYYY-MM-DD（不明なら YYYY-XX-XX で可）
- Event Type: Adopted / ModeChange / Milestone
- Artifact: 採択対象（ファイルパス or 名前）
- Owner: A：HQ（必要なら B/C/D/F/G を併記）
- Notes: 1〜3行（短く）

## 3. File Policy（ファイル運用）
推奨の2系統：

A) イベント固定ログ（不変）
- 例：000_os_bootstrap_v1.0.md
- 例：2025-XX-XX_BOOTSTRAP.md

B) 追記型ログ（年次または連続）
- 例：BOOT_LOG_LUMI_OS_v1.0.md
- 例：PRIVATE_KERNEL_LOG_2025_v1.0.md

## 4. Naming（命名規則）
- 節目・起動：000_*.md
- 日付イベント：YYYY-MM-DD_*.md（仮なら YYYY-XX-XX）
- 追記型：BOOT_LOG_* / PRIVATE_KERNEL_LOG_YYYY_*

## 5. Non-Goals（禁止）
- changelogs を「仕様置き場」にしない
- changelogs を「感情ログ置き場」にしない
- changelogs を「議論ログ置き場」にしない

---

## 6. Done（完了条件）
このポリシーが採択された時点で：
- changelogs は「履歴」専用として固定される
- OS の正本化（lumi-os）が迷子にならない
