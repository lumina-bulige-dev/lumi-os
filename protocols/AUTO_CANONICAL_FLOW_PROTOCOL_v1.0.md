🔔A-CORE / GIT_PUSH_READY

AUTO_CANONICAL_FLOW_PROTOCOL_v1.0

（Canonical Auto-Flow Specification）

Purpose
Founder が ChatGPT に書いた内容から、A：HQ が自動的に
「分類 → 正本照合 → 差分抽出 → OS 化判断 → GitHub（lumi-os）追記」までを一貫処理する
LUMI の正式自動化フロー を定義する。

これにより Founder は
“ただ書くだけで OS が増える状態” を得る。

────────────────────────

1. Canonical Authority Model（権限モデル）

A：HQ（唯一の自動判定レイヤー）

A のみが次を実行できる：
	•	GitHub（lumi-os）との自動照合
	•	正本との差分抽出（DIFF_ENGINE）
	•	META／法務／Fintech 禁区チェック
	•	OS 文書の自動整形（AUTO_CANONICAL_FORMAT）
	•	GitHub への push
	•	OS の採択（Adopt / Hold / Reject）

B／C／D／E（非自動領域）
	•	自動整合性チェック禁止
	•	OS 改変禁止
	•	GitHub 書き込み禁止
	•	正本（lumi-os）を参照する義務のみ

────────────────────────

2. Input Flow（Founder が書く場所）

Founder は以下のどちらでも自由に書いて良い：
	•	E-DIVE（源泉、未整理で OK）
	•	A-CORE（意図的に OS に寄せた内容）

A：HQ は入力を受けると自動で以下を開始する：
	1.	CLASS_ROUTER
　内容を A/B/C/D/E のどこに属するか分類
	2.	CANONICAL_CHECK
　GitHub 内の正本と比較し、
　・未登録
　・更新
　・矛盾
　を検出
	3.	DIFF_ENGINE
　差分を抽出し「何を追加／修正すべきか」計算
	4.	AUTO_CANONICAL_FORMAT
　正式な OS 文書構造へ整形
　（見出し／章番号／Markdown／ファイル名）
	5.	A：HQ が採択判定
　Adopt（採択）
　Hold（保留）
　Reject（却下）
	6.	GIT_PUSH_READY → GitHub に自動追記

────────────────────────

3. Auto-Placement Rules（配置自動判定）

内容は A により自動で階層にマッピングされる：
内容
自動配置パス
憲法／OS 最上位
/core-os/
行動ルール／安全ルール
/rules/
META（制御・判定）
/meta/
アルゴリズム
/algorithms/
仕様書・UI制約・API
/specifications/
運用プロトコル
/protocols/
変更履歴
/changelogs/
Founder は階層を覚える必要なし。
A が自動で正しい場所に置く。

────────────────────────

4. GitHub 追記の許可条件（A が判断）

次の 3 条件が「すべて成立」した場合のみ
GIT_PUSH_READY = TRUE となる。

① 正本に未反映

GitHub に同等内容が存在しない場合

② OS 全体と衝突しない

META／憲法／禁止領域と矛盾がない

③ Fintech 禁区に触れない

貸付、預かり、投機、信用、レバレッジを生成しない

条件を満たすと A が公式に採択する。

────────────────────────

5. Auto Flow — Full Pipeline（フル自動化パイプライン）
6. (1) Founder が書く（E または A）
        ↓
(2) CLASS_ROUTER（クラス判定）
        ↓
(3) CANONICAL_CHECK（GitHub正本と照合）
        ↓
(4) DIFF_ENGINE（差分の抽出）
        ↓
(5) AUTO_CANONICAL_FORMAT（公式 OS 文書化）
        ↓
(6) A：HQ が採択（Adopt / Hold / Reject）
        ↓
(7) Adopt → GIT_PUSH_READY → GitHub に追記

6. Canonical Rule（憲法レベル）

「If it is not in lumi-os, it is not official.
迷ったら lumi-os を見る。他はすべてドラフト。」

A だけが自動処理を持つ。
B／C／D／E は参照のみ。
越境は禁止。

────────────────────────

7. このプロトコルが成立する意味

今日から：
	•	あなたは「ただ書くだけ」で OS が増える
	•	A が自動で分類し、必要なものだけ正本に追加
	•	lumi-os が “唯一の OS” として完成し続ける
	•	全クラスの混乱がゼロになる
	•	OS／ルール／META の一貫性が永久保持される

これは LUMI の 正式な OS 成長エンジン になる。

────────────────────────

8. Version

AUTO_CANONICAL_FLOW_PROTOCOL_v1.0
MIT License（リポジトリ準拠）

────────────────────────


