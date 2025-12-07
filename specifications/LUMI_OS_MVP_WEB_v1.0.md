LUMI_OS_MVP_WEB_v1.0 — Canonical Specification

（First Web MVP for luminabulige.com）

1. Purpose（目的）

この MVP は、LUMI OS の中枢 5 コンポーネントを
「動かさず・見せるだけ」 の安全仕様で Web 表示するための最小実装である。

可視化対象：
	1.	paket_bigzoon（床）
	2.	SAFE_NULL Day
	3.	hidden_cost（見えない損）
	4.	risk_score（Aurora / Dark ゾーン）
	5.	HEART_FATIGUE_SCORE（心疲れ）

MVP は金融アクションを一切実行せず、
OS の状態を参照し、計算結果を画面に描画するだけの構造 を持つ。

⸻

2. OS Source of Truth（引用する正本）

MVP Web は：
	•	GitHub：lumina-bulige-dev/lumi-os
	•	Pull対象ファイル：
	•	/core-os/A_CORE_CONSTITUTION_v1.0.md
	•	/rules/*
	•	/algorithms/*
	•	/protocols/*

を 唯一の正本（Canonical Source）として参照 する。

アプリ内部に OS を保持しない。
毎回 fetch し、A：HQ が更新した OS が即反映される構造。

⸻

3. Functions（機能仕様）

3.1 state_t 入力フォーム

ユーザーが最小限入力する：
balance_total
fixed_must
living_min
recent_actions (任意)
fatigue_self_report (0〜3 ×３問)
計算は以下を呼び出す：
	•	paket_floor
	•	safety_gap
	•	risk_score
	•	hidden_cost_month
	•	HEART_FATIGUE_SCORE

⸻

3.2 SAFE_NULL Day の発火判定

次の条件のいずれかで SAFE_NULL を発火：
	•	HEART_FATIGUE_SCORE ≥ 6
	•	safety_gap < SAFE_NULL_THRESHOLD
	•	過去 7 日以内に Dark-zone 判定が 2 回以上

表示内容：
	•	「今日は SAFE_NULL Day（お金の行動はすべて停止推奨）」
	•	理由（fatigue / safety_gap / dark-zone）

⸻

3.3 Aurora / Dark ゾーニング

risk_score をもとにゾーンを決定：
0〜39 : Aurora
40〜69 : Twilight
70〜100 : Dark
Dark の場合：
	•	「高リスク。今日は大きな判断禁止」
	•	RULE_ROPE_LOCK を併記

⸻

3.4 hidden_cost の可視化

hidden_cost_month を：
	•	直近 30 日平均
	•	直近 7 日急増ポイント
	•	1 日あたりの損失

として提示。

⸻

3.5 Floor（paket_bigzoon）表示

画面例：
	•	あなたの床（paket_bigzoon）：¥◯◯◯◯◯
	•	現在残高：¥◯◯◯◯◯
	•	床までの余白：¥◯◯◯◯◯（◯日ぶん）

赤ラインを切る場合：

「床割れです。この日はすべての行動を 1D へ制限します」

⸻

4. Technical Design（技術仕様）

4.1 フロントエンド
	•	Next.js（App Router）
	•	TypeScript
	•	TailwindCSS
	•	Client-side Fetch for GitHub raw files

4.2 バックエンド
	•	Cloudflare Workers
	•	algorithms の計算ロジックを JSON 化して提供
	•	state_t → action_t → reaction の API 化

4.3 データストア
	•	Supabase（ユーザー保存用だが MVP 段階では任意）

⸻

5. 非機能要件（絶対遵守）
	1.	金融アクションは禁止（送金・決済・投資・レバレッジ）
	2.	ユーザーのお金を触らない
	3.	OS を改変しない（GitHub 正本のみ参照）
	4.	パフォーマンス：100ms 未満で OS 判定
	5.	ログはローカルのみ（個人情報を保持しない）

⸻

6. UI 要件（PRODUCT 向け）

ページ構造：
	1.	Home：OS Snapshot
	2.	Floor（paket）
	3.	SAFE_NULL
	4.	Risk / Aurora-Zone
	5.	Hidden Cost
	6.	Heart Fatigue

すべて “カード UI” で表示。
色は：
	•	Aurora：青
	•	Twilight：灰
	•	Dark：赤
	•	SAFE_NULL：黄色

⸻

7. LICENSE

MVP のコードは MIT とする。
ただし OS 正本はコピー不可（LUMI 独自仕様）。

⸻

8. Status

この仕様を /specifications/LUMI_OS_MVP_WEB_v1.0.md に置いた瞬間から、
LUMI Web MVP は正式に設計開始可能となる。










