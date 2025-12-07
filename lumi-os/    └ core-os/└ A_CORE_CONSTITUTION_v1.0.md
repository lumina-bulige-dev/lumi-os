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


　

