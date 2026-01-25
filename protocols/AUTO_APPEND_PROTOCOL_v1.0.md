🔔A-CORE / NOTICE  
LUMI Canonical Header Policy v1.2

※本ファイルは A：HQ（Founder＋LUMI_A）のみ編集可。  
B／C／D／E は参照のみとし、文言の引用・改変は禁止とする。

本ファイルは LUMI OS 正本（lumi-os/）の一部であり、  
内容の改変・加筆・派生仕様の生成・PR 提案は A：HQ 以外のクラスには認められない。

If it is not in lumi-os, it is not official.

⸻

# AUTO_APPEND_PROTOCOL v1.0

Canonical Auto-Append Specification（正式自動追記プロトコル）

※本ドキュメントは A：HQ 専用。  
正本は lumi-os/ リポジトリ内の本ファイルに従う。  
B／C／D／E は参照のみを認める。

⸻

## 0. Purpose（目的）

このプロトコルは、A：HQ が採択した内容を
**自動的に GitHub（lumi-os/）の正本へ追記する仕組み** を定義する。

目的：
1. Founder が「ただ書くだけ」で OS が成長する状態を実現する
2. 手動ミス（配置間違い・フォーマットずれ・バージョン管理漏れ）を排除する
3. OS の一貫性・追跡性・正本性を自動的に保証する

⸻

## 1. Scope（適用範囲）

**適用対象：**
- A：HQ が Adopt（採択）と判断した OS コンテンツすべて
- 分類：rules / meta / algorithms / protocols / specifications / core-os

**非適用対象：**
- Hold（保留）または Reject（却下）とされたもの
- E-DIVE（ドラフト層）のコンテンツ（昇格前）
- B／C／D／E が独自生成したもの（許可されていない）

⸻

## 2. Core Rules（中核ルール）

### 2.1 自動追記の権限

**A：HQ のみが自動追記を実行できる。**

B／C／D／E による以下の行為は禁止：
- GitHub への直接 push
- 自動整形処理の実行
- OS ファイルの編集・リネーム・移動

### 2.2 追記条件（GIT_PUSH_READY）

以下の 3 条件をすべて満たした場合のみ追記される：

1. **正本に未反映**  
   - GitHub 内に同等内容が存在しないこと
2. **OS 全体と衝突しない**  
   - 憲法・META・禁止領域と矛盾しないこと
3. **Fintech 禁区に触れない**  
   - 貸付・預かり・投機・信用・レバレッジを生成しないこと

⸻

## 3. Auto-Append Flow（自動追記フロー）

### 3.1 前段処理（AUTO_CANONICAL_FLOW による）

```
(1) Founder が書く（E または A）
     ↓
(2) CLASS_ROUTER（クラス判定）
     ↓
(3) CANONICAL_CHECK（GitHub 正本と照合）
     ↓
(4) DIFF_ENGINE（差分の抽出）
     ↓
(5) AUTO_CANONICAL_FORMAT（公式 OS 文書化）
     ↓
(6) A：HQ が採択（Adopt / Hold / Reject）
```

### 3.2 追記処理（AUTO_APPEND_PROTOCOL）

```
(7) GIT_PUSH_READY = TRUE の確認
     ↓
(8) ファイル自動配置（パス決定）
     ↓
(9) バージョン番号の自動付与
     ↓
(10) Git commit & push（A：HQ 経由）
     ↓
(11) 変更ログへの自動記録
```

⸻

## 4. 自動配置パス（Auto-Placement）

内容は A により自動で次の階層にマッピングされる：

| 内容                          | 自動配置パス          |
|-------------------------------|----------------------|
| 憲法／OS                      | /core-os/            |
| 行動ルール／安全ルール        | /rules/              |
| META（制御・判定ロジック）    | /meta/               |
| アルゴリズム                  | /algorithms/         |
| 仕様書・UI制約・API           | /specifications/     |
| 運用プロトコル                | /protocols/          |
| 変更履歴                      | /changelogs/         |

Founder は階層を覚える必要はない。  
A が CLASS_ROUTER 経由で正しい場所へ配置する。

⸻

## 5. ファイル命名規則（Auto-Naming）

すべての OS 文書は以下の形式で命名される：

```
{CATEGORY}_{NAME}_{VERSION}.md
```

**例：**
- `MONEY_FLOW_STABILIZER_v1.0.md`
- `AUTO_APPEND_PROTOCOL_v1.0.md`
- `LUMI_CORE_HOME_MVP_API_POLICY_v1.0.md`

命名は A が自動で行う。  
Founder が手動でファイル名を決める必要はない。

⸻

## 6. バージョン管理（Auto-Versioning）

### 6.1 初回追加

初めて追記される文書は `v1.0` とする。

### 6.2 更新時

- 構造的変更・機能追加：メジャーバージョンアップ（`v1.0 → v2.0`）
- 誤記修正・軽微な改善：マイナーバージョンアップ（`v1.0 → v1.1`）

バージョン番号は A が自動判定する。

### 6.3 旧バージョンの扱い

旧バージョンは削除せず、以下のいずれかで保管：
- 同じファイルにアーカイブセクションとして追記
- `/changelogs/` に移動

⸻

## 7. 変更ログへの自動記録

追記のたびに以下を `/changelogs/` に記録：

- 日時（ISO 8601 形式）
- 変更内容（新規追加 / 更新 / 削除）
- ファイルパス
- 採択理由（A：HQ コメント）

**例：**

```
2026-01-08T22:00:00Z
[ADD] /protocols/AUTO_APPEND_PROTOCOL_v1.0.md
Reason: Canonical auto-append system の運用定義完成
```

⸻

## 8. 手動追記の禁止

**A：HQ 以外による以下の行為は禁止：**

- GitHub への直接 commit / push
- OS ファイルの編集・削除・リネーム
- 自動整形処理の手動実行
- バージョン番号の手動変更

違反した場合：
- 変更内容は A：HQ により自動的に revert される
- 正本の整合性が優先される

⸻

## 9. Implementation Status（実装状況）

**現状（v1.0 時点）：**
- CLASS_ROUTER / CANONICAL_CHECK / DIFF_ENGINE は  
  ChatGPT ＋ Founder の手動フローとして運用
- GitHub push は Founder が手動で実行（A 専任作業）

**将来：**
- A 専用の Worker（Bot）が自動的に：
  - GitHub への PR 生成
  - 差分レビュー
  - A：HQ 承認後の自動マージ
- を実行する構造を想定

⸻

## 10. Relation to Other Protocols（関連プロトコル）

- `/protocols/AUTO_CANONICAL_FLOW_PROTOCOL_v1.0.md`  
  → 本プロトコルの上位フロー定義
- `/protocols/OPERATION_START_v1.0.md`  
  → LUMI OS 運用開始宣言
- `/rules/A_ONLY_AUTOCHECK_POLICY_v1.0.md`  
  → A のみが自動処理を持つ憲法ルール

⸻

## 11. Effect（このプロトコルが成立する意味）

このプロトコルが回っている限り：

- Founder は「ただ書く」ことに集中できる
- A が自動／半自動で分類し、必要なものだけ正本に追加する
- lumi-os は **唯一の OS** として成長し続ける
- B〜E は常に「正本だけを見る」ため、クラス間の混乱が最小化される
- OS／ルール／META の一貫性が、プロジェクトの寿命より長く維持される

⸻

## 12. Canonical Rule（憲法レベル再掲）

"If it is not in lumi-os, it is not official.  
迷ったら lumi-os を見る。他はすべてドラフト。"

- A だけが自動処理を持つ。
- B／C／D／E は参照のみ。
- 専用領域の越境は禁止。

⸻

## 13. Version

AUTO_APPEND_PROTOCOL v1.0  
MIT License（リポジトリ準拠）

⸻
