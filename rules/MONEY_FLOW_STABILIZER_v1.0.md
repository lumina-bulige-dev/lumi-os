🔔A-CORE / NOTICE  
LUMI Canonical Header Policy v1.2

※本ファイルは A：HQ（Founder＋LUMI_A）のみ編集可。  
B／C／D／E は参照のみとし、文言の引用・改変は禁止とする。

本ファイルは LUMI OS 正本（lumi-os/）の一部であり、  
内容の改変・加筆・派生仕様の生成・PR 提案は A：HQ 以外のクラスには認められない。

If it is not in lumi-os, it is not official.
MONEY_FLOW_STABILIZER v1.0

LUMI OS — Financial Stability Core Layer
(Official Canonical Specification)

⸻

0. Purpose

MONEY_FLOW_STABILIZER は、
ユーザーの生活・金銭運転を “即死しない状態” に維持するための基幹 OS 層である。

この OS は、プロダクトの誘導・投機・収益構造ではなく、
人間の毎日の金の動きを「作用・反作用」として捉え、
床（paket_bigzoon）を割らないことを絶対条件とする。

⸻

1. Fundamental Principles
	1.	すべての金の動きには作用と反作用がある。
	•	誰かが払う → 誰かが得る
	•	手数料を払う → 事業者の利益になる
	•	ユーザーが支払うたび、未来側の状態（余白・ストレス・床距離）が変動する
	2.	理解していようがいまいが、作用・反作用は常に発生する。
→ 人間の判断能力に依存させず、OS レベルで管理する必要がある。
	3.	床（paket_bigzoon）は、絶対に割ってはならない。
ここを突破すると、BAD_LOOP（借金・高利息依存）に落下する。
	4.	更新ルール（state → action → reaction）こそが OS の心臓である。

⸻

2. Core Components

2-1. Floor (paket_bigzoon)

床 = 「最低生存＋絶対固定費＋安全バッファ」

OS の絶対保護領域であり、以下の行動は許可されない：
	•	床を割る支出
	•	床距離が negative になる行為
	•	リスクスコアを Dark に押し上げる行為

床を割った状態での支払い・送金・投資提案は禁止（RED）。

⸻

2-2. SAFE_NULL day

SAFE_NULL =
何もしない日を OS が強制的に挟み、BAD_LOOP 侵入を止める “減速装置”。

目的：
	•	判断能力が低下した日の暴発を防ぐ
	•	感情モード（3Hi, APinLv99）から一度抜ける
	•	床距離を再評価し、OS をリセットする

⸻

2-3. statict2x Rule

行動頻度の急増（tension, APin）を OS レベルで抑制する。

例：
	•	通常 1 回の送金 → APin 状態で 3 回 → 禁止／減速
	•	その日の “行動限度” を OS が自動で設定する

目的：
感情テンションが高いときほど破滅的行動をしやすいため。

⸻

2-4. 1D Rule

ユーザー認知負荷・情動負荷が限界に達したとき、
選択肢を 1 つに制限する決定ルール。

複雑な判断を排除し、床保護に集中させる。

⸻

2-5. RULE_ROPE_LOCK（旧：AnimaruAPinLv99）

APinLv99（高テンション・高衝動モード）は OS で “封鎖対象”。

以下の制限を発動：
	•	高額支出 → 即ロック
	•	送金 → 要二重確認
	•	新規契約 → 即停止
	•	リスクスコア上昇 → Aurora提案停止

目的：
人間の “暴発” を OS 側で物理的に止めるため。

⸻

3. Financial Update Law（作用・反作用モデル）

式の中心：

state_t + action_t 
    → reaction(state_t, action_t)
    → state_{t+1}

state_t（例）
	•	balance_total
	•	paket_floor
	•	fixed_must
	•	living_min
	•	risk_score
	•	hidden_cost_month

action_t（例）
	•	amount
	•	type
	•	fee_visible
	•	fee_effective

reaction（更新）
	1.	balance_total -= amount + fee_total
	2.	床距離（safety_gap）更新
	3.	hidden_cost_month += hidden_cost(action)
	4.	risk_score = f(floor_distance, behavior_type, hidden_cost)

→ OS は「即死回避」を最優先に state_{t+1} を算出する。

⸻

4. BAD_LOOP / GOOD_LOOP

4-1. BAD_LOOP（禁止対象）
	1.	お金に困る
	2.	借りる
	3.	利息で苦しくなる
	4.	さらに借りる
	5.	返せずに即死

OS 原則：
ユーザーが苦しむほど儲かる構造（利息ビジネス）を永久に排除する。

⸻

4-2. GOOD_LOOP（LUMI が作る好循環）
	1.	見えない損が見える
	2.	床を割らない
	3.	hidden_cost が減る
	4.	余白が生まれる
	5.	OS をリピートすることで継続安定

収益モデル（許可）：
	•	OS 訓練のサブスク
	•	Aurora 提案の差額フィー（saving > 0 のときのみ）
	•	B2B OS ライセンス

禁止：
	•	レバレッジ
	•	高利息モデル
	•	預かり金
	•	投機誘導

⸻

5. User Paradox & OS Role

ユーザーは：

使いたい > 得したい > 損したくない > でも中身は見ない

OS の役割：
	•	「使うな」とは言わない
	•	見える化 + 減速 + SAFE_NULL を前に置く
	•	使う前に “床 を割らないか” を OS が評価する

⸻

6. Canonical Status

本ドキュメントは：
	•	A：HQ にて採択
	•	GitHub lumi-os レポジトリに配置
	•	MONEY_FLOW_STABILIZER の v1.0 正式版とする

⸻

END OF SPEC

────────────────────────

