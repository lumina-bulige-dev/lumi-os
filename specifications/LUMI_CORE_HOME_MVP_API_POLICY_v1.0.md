LUMI_CORE_HOME_MVP_API_POLICY_v1.0

（A：HQ Canonical Specification / HOME_v1.0 + MVP API Policy）

⸻

1. 目的（Purpose）

LUMINABULIGE-core の MVP において：
	•	ホーム画面に必須となる OS 情報
	•	B：INFRA が実装すべき API の本数と責務
	•	C：PRODUCT が画面へマッピングする際の不変ルール

を A：HQ の Canonical Policy として確定する。

本ドキュメントは LUMI OS の正本（canonical）であり、
B／C はここに書かれた内容のみを実装・利用する。

⸻

2. MVP API セット（A：HQ により 4 本に限定）

MVP で使用を許可する API は 以下 4 本のみ とする。
#
Method / Path
目的
1
GET /api/v1/core/home_state
ホーム画面で必要なすべての値を 1 本で返す
2
POST /api/v1/os/reaction
LUMI OS の心臓部（floor / risk / metrics の計算）
3
POST /api/v1/goal/buffer
床（paket_bigzoon）計算 API
4
GET /api/v1/links/wise
Wise リンクを返す B 管理 AP
A の承認なく 5本目の API を追加してはならない。

⸻

3. HOME_v1.0（OS 定義）

ホーム画面は：

「今日の自分の安全度を 5 秒で掴む場所」

と定義する。

A：HQ は次の 4 要素を必須とする：

⸻

3-1. 床（floor）と残高（balance）
balance_total
paket_bigzoon
floor_status = SAFE | WARNING | DANGER
floor_status の意味：
	•	SAFE：床から十分な距離がある
	•	WARNING：床が近い（注意）
	•	DANGER：床スレスレ（大きな行動は禁止推奨）

⸻

3-2. 30日チャレンジ状態
day_in_challenge
is_safe_null_today
safe_move_limit
•	is_safe_null_today = true
→ 今日は何もしなくても OK（SAFE_NULL day）
	•	safe_move_limit
→ 今日、床を割らずに動かせる上限額
→ 負値は B が 必ず 0 に丸める（正規化ルール）

⸻

3-3. 心のブレーキ状態（ライト版）
risk_mode = NORMAL | TIRED | RED
•	TIRED → 「少し疲れているため大きな判断は控えめに」
	•	RED → 「今日は重大行動禁止（OSの原則）」

⸻

3-4. Aurora（手数料ルーペ）入口
	•	「手数料を見る（Aurora）」ボタン
	•	遷移は GET /api/v1/links/wise 経由のみ
	•	直接 URL を埋め込むことは禁止（B の責務）

⸻

4. API 詳細（B-INFRA 実装責務）

⸻

4-1. GET /api/v1/core/home_state

ホーム画面のための まとめ値 API。

返却例（canonical）：
{
  "balance_total": 320000,
  "paket_bigzoon": 300000,
  "floor_status": "SAFE",

  "challenge": {
    "day_in_challenge": 7,
    "is_safe_null_today": true,
    "safe_move_limit": 0
  },

  "heart": {
    "risk_mode": "NORMAL"
  }
}
4-2. POST /api/v1/os/reaction

state → metrics を算出する心臓部。
	•	floor 判定
	•	risk_mode 計算
	•	safe_move_limit の計算（負値 → 0）
	•	SAFE_NULL 判定

本 API の出力が /core/home_state の計算根拠となる。

⸻

4-3. POST /api/v1/goal/buffer

バッファ設定から床（paket_bigzoon）を決定する。
paket_bigzoon = fixed_must + living_min + buffer_multiplier
A の OS 仕様に完全準拠すること。

⸻

4-4. GET /api/v1/links/wise

Wise の referral URL を返す。

例：
{
  "url": "https://wise.com/jp/invite/...ref=xxxxx"
}
異常時：
	•	ステータス 500
	•	url 不返却

C は URL の値に触れず redirectTo(url) のみ行う。

⸻

5. C：PRODUCT の画面マッピング原則

⸻

5-1. 上部：残高・床
	•	「残高：¥{balance_total}」
	•	「床　：¥{paket_bigzoon}」
	•	floor_status バッジ（SAFE / WARNING / DANGER）

共通文：

床を下回ると、来月の固定費と生活費が危険になります。

⸻

5-2. 中央：30日チャレンジ

条件分岐：
	•	is_safe_null_today = true
→ 「今日は“何もしない”でも合格です」
	•	safe_move_limit > 0
→ 「今日は ¥{safe_move_limit} まで動かしても安全です」
	•	safe_move_limit = 0
→ 「今日は床のすぐ上です。大きな支出はおすすめしません」

⸻

5-3. 下部：心のブレーキ
	•	NORMAL → 「いつも通り判断できます」
	•	TIRED → 「疲れ気味です。大きな判断は控えめに」
	•	RED → 「今日は大きな決断は避けましょう」

⸻

5-4. Aurora（Wise）入口
	•	ボタン名：「手数料を見る（Aurora）」
	•	注意文：
Wise の画面が開きます。LUMI からは送金できません。

⸻

6. 境界（Boundary Rules）
	•	B：INFRA
→ この 4 本以外の API を勝手に作らない
	•	C：PRODUCT
→ 再計算禁止。受け取った値だけで UI を構成する
	•	A：HQ
→ canonical のみを更新できる唯一のレイヤー

⸻

7. 効力（Effective Date）

本ドキュメントが lumi-os に保存された瞬間から正式 OS となる。














