# A_CORE_CONSTITUTION v1.0  
LUMINA BULIGE / LUMI OS 憲法（初版）

本ドキュメントは、LUMINA BULIGE（以下 LUMI）の  
OS・原則・モデルの「憲法」として機能する。

ここに書かれたものは、A：HQ が採択し、GitHub（lumi-os）に保存された時点で  
LUMI 全クラス（A/B/C/D/E）が従うべき「正本（canonical）」となる。

---

## 0. 立ち位置とミッション

### PRODUCT_CORE_STATEMENT

LUMI が売るもの：
- 「今より悪くならないための金 OS」
- 「見えない損と床を見せるルーペ」

LUMI が売らないもの：
- レバレッジ
- 約束された利回り
- “困っている人から利息を抜く”ビジネスモデル

---

## 1. MACRO 足場（業界構造と POWER_GAP）

### 1-1. Fintech 収益構造の 4 パターン

一般的な Fintech は、主に以下の 4 本で収益を上げている：

1. 取引ごとの手数料（Transaction Fee / Spread）  
2. カードのインターチェンジ（加盟店手数料）  
3. サブスク & プレミアム（Subscription / Freemium）  
4. 貸付・スプレッド・埋め込み金融（Lending / Spread / Embedded）

LUMI は、この「プロダクトを増やす側」では勝負しない。

### 1-2. POWER_GAP_MODEL

- 銀行・カード・巨大 Fintech（資源モンスター）は  
  - インフラ  
  - プロダクト量産  
  - マーケ  
  の 3 点セットで戦う。

- LUMI はここでは戦わない。

LUMI が取る場所：
1. インフラは「使わせてもらう側」に立つ  
   - Wise／銀行／決済サービスなど既存インフラを “素材” とみなす。

2. ユーザー側の「OS」と「フィルタ」を握る  
   - どのサービスをどう使えば即死しないか  
   - どこでどれだけ抜かれているか  
   - 床（paket_bigzoon）を割らずに「使いたい」を通すルート  
   を設計し、見せる側になる。

3. 「使いたくなるモノ」を作る側ではなく、  
   「使いたくなるモノ」を  
   - 分類  
   - 採点  
   - Aurora / Dark 判定  
   する “ルーペ（LOUPE）” を提供する。

> 資源モンスターは「山（プロダクト）」を作る側。  
> LUMI は「その山をどう登るか／どこが落とし穴か」を見せる側。

### 1-3. LOUPE_MODEL（ルーペ式ポジション）

- LUMI は「新しいお金プロダクト」を増やす側ではなく、  
  既にあるお金の流れにルーペを当てる側。
- どこで・どれだけ・誰に抜かれているかを見せるのが仕事。
- 床（paket_bigzoon）と一発退場だけは、その前に必ずチェックする。

---

## 2. MICRO 足場（1人の生活 × 金銭 OS）

### 2-1. paket_bigzoon（床）

変数：
- `balance_now`：今日この瞬間の残高（合計 or 口座別）
- `fixed_must`：家賃・光熱費・返済など「絶対払う」合計（30日分）
- `living_min`：最低限の生活費（30日分）
- `buffer`：安全マージン（fixed_must + living_min の 1〜3倍）

定義：
- `paket_bigzoon = fixed_must + living_min + buffer`  
  → 「絶対に割りたくない大きいバケツ（床）」

### 2-2. tekikaku_当日必要値

- `next_income`：次の入金日（給料日など）
- `days_left`：今日を含む next_income までの日数

- `tekikaku_当日必要値 = paket_bigzoon残 / days_left`  
  → 「今日の終わりに、ここは下回りたくない」ライン

### 2-3. COLOR 判定（RED / YELLOW / GREEN）

- 支出後残高：  
  - `balance_after = balance_now - T`  
  - `free_after = balance_after - paket_bigzoon`

**RED（#F00000）：**
- 条件：`balance_after < paket_bigzoon`  
- 意味：生活＋信用フロア割れ（即死リスク）  
- LUMI の推奨：原則「強 STOP（LUMI_STOPBUY 寄り）」

**YELLOW：**
- 条件：`balance_after < tekikaku_当日必要値`  
- 意味：「今日のラインを割る。やるなら覚悟ゾーン。」

**GREEN：**
- 条件：`balance_after >= tekikaku_当日必要値`  
- 意味：「今日のラインは守れている。」

### 2-4. MONEY_FLOW_STABILIZER v0.1 要点

1. LUMI は money_flow を「止める権限」は持たない。  
   → できるのは “見える化” と “signal（注意喚起）” まで。

2. `paket_bigzoon` と `tekikaku_当日必要値` は、  
   USER の「生活フロア」と「信用フロア」を守るための内部基準。

3. RED が点灯した支払いは、  
   原則「LUMI_STOPBUY 寄り」として扱い、  
   新しいキャンペーン・新 pay_page よりも  
   フロア（paket_bigzoon）の維持を優先する。

4. `SPECTAL_BULIGgasscoop`（遠くのお金まで見渡せ率）は  
   - horizon_score（どこまで先が見えているか）  
   - breadth_score（どれだけ多くの口座／サービスをカバーしているか）  
   から計算し、低いときは「近視判定」として説明する。

5. `nosmoall_top10` により、  
   細かいノイズではなく、本当に効いている支出・手数料 TOP10 から潰す。

---

## 3. 橋渡し（アルゴリズム基盤）

### 3-1. MONEY_ACTION_REACTION_LAW

1. すべての金の動きには「相手側の変化」が必ずある。  
   - 誰かが支払う＝誰かが受け取る  
   - 手数料を払う＝事業者の利益になる  

2. すべての金の動きには「自分の未来側の変化」もある。  
   - 今の1回の支出が、  
     - 床（paket_bigzoon）との距離  
     - 将来の義務（返済・固定費）  
     - リスク（即死確率）  
     に必ず反映される。

3. この作用・反作用は、「見える／見えない」に関係なく発生する。

> 理解している側だけが、この作用・反作用を意図的に使って儲けている。

### 3-2. ALGO_BASE_NECESSITY

- 金の作用・反作用は「毎日」「何十回」「人×サービス×国」単位で発生する。  
- 人間の感覚だけだと：  
  - そのうち数個しか追えない  
  - ヤバいときほどテンションに飲まれて見えなくなる  

→ だから LUMI では、以下の更新ルールに落とす：

```text
state_t      （いまの状態）
action_t     （今日の行動）
reaction_t+1（床との距離・リスク・Aurora/Dark）
3-3. LUMI_ALGO_STATE_ACTION_REACTION v0.1

state_t（例）
state_t = {
  balance_total,        # 総残高
  paket_floor,          # 床（paket_bigzoon）
  fixed_must,           # 絶対払う固定
  living_min,           # 最低生活費
  risk_score,           # 即死リスクの内部スコア
  hidden_cost_month,    # 今月の見えない損の累計
}
action_t（例）
action_t = {
  amount,               # 金額
  type,                 # 種類（送金／遊び／ギャンブル／投資／サブスク…）
  fee_visible,          # 表向き手数料
  fee_effective,        # effective_fee_rate 推定
}

更新関数
reaction(state_t, action_t) -> state_t+1
ここに「金の作用・反作用の法則」を
正式に書き下していくのが LUMI_ALGO の仕事である。

⸻

4. BAD_LOOP / GOOD_LOOP モデル

4-1. LUMI_BAD_LOOP（やらない側のループ）

悪いパターン：
	1.	お金に困る
	2.	借りる（高い利息）
	3.	返済でさらに苦しくなる
	4.	もっと借りる
	5.	返せなくなる → 即死 or 半即死

＝ ユーザーが困るほど、貸す側・利息取る側だけが“好循環”になるループ。

LUMI はこのループを OS レベルで拒否する。

4-2. LUMI_GOOD_LOOP（取りに行く側のループ）

目指すループ：
	1.	ユーザーが「金の見えない部分」を知る（Loupe）
	2.	床（paket_bigzoon）と SAFE_NULL で、一発退場だけ踏まなくなる
	3.	ムダな「見えない損」が減る（hidden_cost_month ↓）
	4.	そのぶん、お金と心に “少し余白” ができる
	5.	「このOS悪くないな」と思えば、30〜90日チャレンジをリピートする

LUMI の収益：
	•	OS トレーニング代（サブスク or 期間課金）
	•	Aurora 側サービスへの紹介料

条件：
	•	ユーザーが“苦しいほど儲かる”構造は持たない。
	•	床を守る力がつくほど、LUMI のリピートが起きる構造にする。

⸻

5. USER パラドックスと LUMI の役割

5-1. LUMI_USER_PARADOX v1.0
	1.	使いたい が勝つ
	•	「便利」「早い」「カッコいい」が先に立つ。
	2.	損はしたくない
	•	本音では「減るのはイヤ」「床は割りたくない」。
	3.	見えないまま「使いたい」を握られる
	•	決済・サブスク・投資ボタンを
捕食者側（手数料・スプレッドを取る側）が握る。

＝ 「使いたい＞🉐＞損したくない＞でも見えない」
　この矛盾状態のまま、マネーゲームが回っている。

5-2. LUMI_ROLE_IN_PARADOX
	•	ユーザーの「使いたい」を否定しない。
	•	捕食者に握られている“見えない部分”だけを全部見せる。
	•	床（paket_bigzoon）と一発退場だけは踏ませない OS を前に置く。

＝ 「使うな」と説教するサービスではなく、
　「見える＋減速＋ SAFE_NULL」をかませてから
　“使いたい
---

## Linked Protocols
This OS follows the automation and governance rules defined in:

- **AUTO_APPEND_PROTOCOL v1.0**  
  (`/protocols/AUTO_APPEND_PROTOCOL_v1.0.md`)

These protocols govern how A:HQ promotes drafts → canonical OS documents in lumi-os.
🔔A-CORE / GIT_PUSH_READY

A_CORE_CONSTITUTION_v1.0 — 正式全文（GitHub 追記用）

以下は そのまま GitHub の既存 A_CORE_CONSTITUTION_v1.0.md の続きに貼れるよう
構造・見出し・Markdown 整形済みで作成しています。
（重複を避けるため、あなたがもう書いた部分は除外して“残り全部”だけを生成しています。）

⸻

6. POWER_GAP_MODEL（金融インフラとの位置関係）

LUMI は 銀行・カード・巨大Fintech（資源モンスター） と
同じ土俵（プロダクト量産・手数料争い）では戦わない。

原則：
	1.	インフラは素材として利用する
	•	Wise／銀行／カードネットワーク／既存API を自前で再発明しない。
	2.	ユーザー側の判断 OS を握る
	•	どのサービスを、どういう条件で使えば即死を避けられるか。
	•	Hidden Cost（見えない損）を計算し、見せる側に回る。
	3.	“山を作る側” ではなく “山の登り方” を提供する
	•	プロダクトを増やす側ではなく、評価・判定・フィルタ（Loupe）を作る側。

⸻

7. LOUPE_MODEL（可視化 OS）

LUMI の役割は、
「見えない損・見えない床・見えない未来の悪化」を 可視化する唯一のレイヤー。

定義：
	•	LUMI はユーザーのお金を 運用しない。
	•	LUMI はユーザーのお金を 預からない。
	•	LUMI はユーザーの行動を 止める権限を持たない。
	•	できることは
“見える化” と “signal（注意喚起）” と “減速（SAFE_NULL）” のみ。

⸻

8. FINTECH_BOUNDARY（禁止領域）

LUMI OS は以下を永久に禁止する：
	1.	レバレッジの提供（FX/CFD/仮想通貨証拠金）
	2.	預かり金・カストディ
	3.	貸付・BNPL・与信判断・スコア販売
	4.	約束利回り・投資助言・運用指示
	5.	ユーザーが損するほど LUMI が儲かる構造
	6.	暗黙の自動実行（ユーザー承認なしの操作）

これらは OS の “憲法違反” とし、B／C／D のいかなる提案も A が拒否する。

⸻

9. RISK ZONING（Aurora / Twilight / Dark）

ユーザー状態（state_t.risk_score）を三分割する：
Zone
risk_score
意味
Aurora
0–49
通常〜軽度注意
Twilight
50–79
リスク増大、減速推奨
Dark
80–100
即死率高、提案停止域
Dark では：
	•	AUTO_AURORA_ROUTER を 強制停止
	•	LUMI_fee = 0
	•	signal のみ許可
	•	新規決済・送金への積極提案は行わない

⸻

10. MONEY_FLOW_STABILIZER（生活 OS）

目的：
ユーザーの生活フロア（paket_bigzoon）と信用フロアを守る OS。

主要コンポーネント：
	•	paket_bigzoon = fixed_must + living_min + buffer
	•	tekikaku_day_line = paket_bigzoon残 / days_left
	•	nosmoall_top10（効いているTOP10をそのまま見る）
	•	pulscost/spectal 系の手数料高騰検知
	•	RED (#F00000) ＝「床割れ（floor breach）」判定
	•	YELLOW ＝「今日の必要ライン割れ」
	•	GREEN ＝「安全圏」

RED では必ず：
	•	LUMI_STOPBUY 寄り
	•	AO_ROUTER 停止
	•	fee = 0
	•	signal のみ
	•	新たな勝負をさせない（OS ブレーキ）

⸻

11. AUTO_AURORA_ROUTER（正式定義）

唯一許可される「最適化エンジン」。

条件
	1.	saving > 0 のときだけ実行
	2.	user_gain ≥ 0 を必須
	3.	RED では提案中止
	4.	毎回ユーザー承認（自動実行禁止）
	5.	改ざん不能ログ必須
	6.	α（LUMI取り分）は 0.10〜0.75 のレンジで OS 管理

ユーザーが得した差額（saving）から
最大 75% までを LUMI_fee にできるが、
ユーザーの実効コストが before を上回ることは禁止。

⸻

12. CLASS BOUNDARY（越境禁止の絶対ルール）

A：HQ
	•	ルール・OS・META の制定
	•	canonical 更新（唯一）
	•	自動整合性チェック（唯一）

B：INFRA
	•	実装のみ。
	•	ルール作成禁止。
	•	金融禁止領域（貸付・預かり等）に踏み込むコード生成禁止。

C：PRODUCT
	•	UI／UX の落とし込みのみ。
	•	OS／META を変更することは禁止。

D：GTM
	•	市場メッセージ・LP 作成。
	•	誇大・誤認・利回り表現は禁止。

E：DEEP
	•	源泉。
	•	正本ではない。
	•	すべて A を経由しない限り公式にならない。

⸻

13. CANONICAL RULE（憲法の一行）

「LUMI の OS・仕様の正本は GitHub（lumi-os）に置く。
迷ったら lumi-os を見る。他のすべてはドラフトである。」

⸻

14. AUTOCHECK RULE（HQ 限定）

自動整合性チェックを持つのは A：HQ のみ。

B／C／D／E は：
	•	lumi-os を参照する義務
	•	自動補正は不可
	•	正本の更新権限なし

⸻

15. VERSIONING POLICY
	•	canonical 文書は A が採択したときに v1.0 → v1.1 → v1.2 と上げる
	•	過去バージョンは削除しない
	•	全部残して進化履歴を管理する

