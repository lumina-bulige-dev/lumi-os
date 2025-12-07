# LUMI_ALGO_STATE_ACTION_REACTION v0.1

LUMI の金銭 OS を動かす「心臓部ロジック」の標準形。

すべての金の動きは、以下の 3 つで表現する：

- `state_t`      : ある時点でのユーザーのお金状態
- `action_t`     : その時点での 1 つの行動
- `reaction()`   : 作用・反作用を計算して、次の状態 `state_{t+1}` を返す関数

---

## 1. MONEY_ACTION_REACTION_LAW（金の作用・反作用）

1. すべての金の動きには「相手側の変化」が必ずある。  
   - 誰かが支払う = 誰かが受け取る  
   - 手数料を払う = 事業者側の利益になる  

2. すべての金の動きには「自分の未来側の変化」もある。  
   - 今の 1 回の支出が、  
     - 床（`paket_floor`）との距離  
     - 将来の義務（返済・固定費）  
     - リスク（即死確率）  
     に必ず反映される。  

3. この作用・反作用は「見える／見えない」に関係なく発生する。  
   理解していようがいまいが、法則だけは動き続ける。

**結論**：理解している側だけが、この法則を意図的に使って儲けている。  
LUMI は、この作用・反作用を OS に落として「誰でも見える・守れる」状態にする。

---

## 2. ALGO_BASE_NECESSITY（なぜアルゴリズムが要るか）

- 金の作用・反作用は「毎日」「何十回」「人 × サービス × 国」単位で発生している。
- 人間の感覚だけだと：
  - そのうち数個しか追えない
  - ヤバいときほどテンションに飲まれて見えなくなる（3hi）

だから LUMI では、作用・反作用を

```text
state_t      （いまの状態）
action_t     （今日の行動）
reaction_t+1（床との距離・hidden_cost・risk_score）
という更新ルール（アルゴリズム）に落とす。

アルゴリズム = “感覚でやっていた金の運転” を、
いつでも・誰でも・ハイでも・ローでも同じルールで回せるようにする基盤。

⸻

3. state_t の定義
state_t = {
  balance_total,        # 総残高
  paket_floor,          # 床（paket_bigzoon）
  fixed_must,           # 絶対払う固定（30日分）
  living_min,           # 最低生活費（30日分）
  risk_score,           # 即死リスクの内部スコア
  hidden_cost_month,    # 今月の“見えない損”累計
}
•	balance_total
	•	すべての口座・ウォレットを合算した残高。
	•	paket_floor（= paket_bigzoon）
	•	fixed_must + living_min + buffer で定義される「絶対割りたくない大きいバケツ」。
	•	risk_score
	•	即死リスクを 0〜100 で表した内部スコア（Dark ゾーン判定に利用）。
	•	hidden_cost_month
	•	手数料・レート差・不要サブスクなど「見えない損」の今月累計。

⸻

4. action_t の定義
action_t = {
  amount,        # 金額（支出 or 送金 or 両替など）
  type,          # 種類（送金／遊び／ギャンブル／投資／サブスク…）
  fee_visible,   # 表向き手数料
  fee_effective, # effective_fee_rate 推定（スプレッド等を含めた実質コスト）
}
•	type は、後続のルール（BAD_LOOP / GOOD_LOOP / risk_score 更新）で重み付けに使用する。
	•	fee_effective は
	•	表示手数料
	•	スプレッド
	•	為替差損
などをまとめて「実質的な手数料率」として扱う指標。

⸻

5. reaction(state_t, action_t) → state_{t+1}

reaction() は、1 回の行動による「作用・反作用」を OS レベルで更新する関数。

5-1. 更新する主な項目
	1.	balance_total の更新
balance_total_next = balance_total - action_t.amount
	2.	床との距離（safety_gap）
safety_gap = balance_total_next - paket_floor
delta_gap  = (balance_total - paket_floor) - safety_gap  # 床からの悪化額
3.	hidden_cost_month の更新
hidden_cost_month_next = hidden_cost_month + (action_t.amount * action_t.fee_effective)
4.	risk_score の更新（概念レベル）
	•	床との距離が縮むほど加点
	•	hidden_cost_month が増えるほど加点
	•	type がハイリスク（ギャンブル等）のとき加点
	•	SAFE_NULL day などで減点（リセット）

※ 数式の詳細は v0.2 以降でチューニング。
6. BAD_LOOP / GOOD_LOOP への接続

6-1. LUMI_BAD_LOOP（拒否するループ）

悪いパターン：
	1.	お金に困る
	2.	借りる（高い利息）
	3.	返済でさらに苦しくなる
	4.	もっと借りる
	5.	返せなくなる → 即死 or 半即死

= ユーザーが困るほど、貸す側・利息取る側だけが“好循環”になるループ。

LUMI はこのループを OS レベルで拒否する。
（reaction 内で「このループ側に進む action_type には強いペナルティを与える」設計にする）

6-2. LUMI_GOOD_LOOP（取りに行く側）

目指すループ：
	1.	ユーザーが「金の見えない部分」を知る（Loupe）
	2.	床（paket_floor）と SAFE_NULL で、一発退場だけ踏まなくなる
	3.	ムダな「見えない損」が減る（hidden_cost_month ↓）
	4.	そのぶん、お金と心に “少し余白” ができる
	5.	OS が「悪くない」と感じれば、30〜90日チャレンジをリピートする

LUMI の収益：
	•	OS トレーニング代（サブスク or 期間課金）
	•	Aurora 側サービスへの紹介料

条件：
	•	ユーザーが「苦しいほど儲かる」構造は持たない。
	•	床を守る力がつくほど、LUMI のリピートが起きる構造にする。

⸻

7. このドキュメントの役割
	•	B：INFRA に対して：
	•	Cloudflare Worker / API 実装時の “唯一の心臓部仕様” を提供する。
	•	C：PRODUCT に対して：
	•	なぜこのアラート・色・グラフになるのかの「裏のロジック」を説明する基礎。
	•	D：GTM に対して：
	•	「LUMI はどこで止める OS なのか」を対外的に説明するときの技術的裏付け。
	•	E：DEEP に対して：
	•	これ以降の深海アイデアを「state / action / reaction」にマッピングするための土台。

このファイルに書かれた内容は、
A：HQ によって採択された LUMI_ALGO_STATE_ACTION_REACTION v0.1 の正本 である。
---

### 次にやること（あなた）

1. GitHub で `algorithms/LUMI_ALGO_STATE_ACTION_REACTION_v0.1.md` を作成  
2. 上の内容を丸ごと貼る  
3. コミットメッセージは：  
   `Add LUMI_ALGO_STATE_ACTION_REACTION v0.1 (canonical)`  
   くらいでOK

ここまで終わったら、また一言だけ：

> 「ALGO v0.1 コミット完了」

と送ってください。  
そこから次のステップ（AUTO_AURORA_ROUTER か、他クラス連携）に進めます。





