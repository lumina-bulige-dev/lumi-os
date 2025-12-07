🔔A-CORE / GIT_PUSH_READY
MVP_API_REACTION_SPEC_v1.0

1. Endpoint

POST /api/v1/os/reaction

LUMI_OS_MVP_WEB_v1.0 における
state_t + action_t → state_{t+1}
心臓部ロジックを HTTP API 化した中核エンドポイント。

役割：
	•	1回の行動（action）が
	•	床（paket_floor）
	•	safety_gap / delta_gap
	•	risk_score
	•	hidden_cost_month
にどう作用するかを計算し、
	•	UI／GTM／ログが共通で参照できる「単一の判断結果」を返す。

⸻

2. Request
{
  "state": {
    "balance_total": 320000,          // 現在の総残高（円）
    "paket_floor": 250000,            // 床（死守ライン）
    "fixed_must": 120000,             // 月の固定支出
    "living_min": 80000,              // 月の最低生活費
    "risk_score": 35,                 // 現在のリスクスコア（0〜100）
    "hidden_cost_month": 4500,        // 今月の見えない損累計
    "auto_route_enabled": true,       // Aurora提案を許可しているか
    "auto_route_limits": {
      "max_auto_amount": 300000,      // 月内で「おまかせ」に任せてよい合計額
      "max_switch_count": 5,          // 月内でルート切替してよい回数
      "forbid_types": ["gamble"]      // 自動／提案対象外とする action type
    }
  },
  "action": {
    "amount": 50000,                  // 支出 or 送金金額（円）
    "type": "international_transfer", // 行動種別
    "fee_visible": 300,               // 画面上に見える手数料（円）
    "fee_effective": 0.012,           // 実質手数料率（例：1.2）
    "fee_current": 950,               // 現行ルートの総コスト（手数料＋レート換算）
    "fee_candidate_list": [
      { "provider": "wise",   "fee_total": 730 },
      { "provider": "bank_x", "fee_total": 880 }
    ]
  },
  "options": {
    "include_router_decision": true,  // Aurora候補評価も返すか
    "include_diagnostics": true       // デバッグ用メトリクスを含めるか
  }
}
3. Response
   {
  "state_before": {
    "balance_total": 320000,
    "paket_floor": 250000,
    "fixed_must": 120000,
    "living_min": 80000,
    "risk_score": 35,
    "hidden_cost_month": 4500
  },
  "state_after": {
    "balance_total": 270000,          // 320000 - amount（例）
    "paket_floor": 250000,
    "fixed_must": 120000,
    "living_min": 80000,
    "risk_score": 42,                 // 行動後に再計算されたスコア
    "hidden_cost_month": 5450        // 手数料等を反映後
  },
  "metrics": {
    "delta_gap": -5000,               // 行動により床との距離がどれだけ変化したか
    "safety_gap_before": 70000,       // balance_total_before - paket_floor
    "safety_gap_after": 20000,        // balance_total_after - paket_floor
    "floor_status_before": "SAFE",    // SAFE / WARN / RED
    "floor_status_after": "WARN",
    "zone_before": "Aurora",          // Aurora / Twilight / Dark
    "zone_after": "Twilight"
  },
  "alerts": [
    {
      "level": "warning",             // info / warning / danger
      "code": "FLOOR_WARN",
      "message": "この支払いで、床との距離が 20,000 円まで近づきます。"
    }
  ],
  "router_decision": {
    "enabled": true,
    "considered": true,
    "best_candidate": {
      "provider": "wise",
      "fee_total": 730
    },
    "saving": 220,                    // fee_current - best_candidate.fee_total
    "user_gain": 150,                 // saving のうちユーザー取り分（例）
    "lumi_fee": 70,                   // saving のうち LUMI 取り分（例）
    "can_auto_switch": false          // MVP v1.0では常に false（提案のみ）
  },
  "diagnostics": {
    "effective_fee_rate_current": 0.012,
    "effective_fee_rate_best": 0.008,
    "risk_score_delta": 7
  }
}
注記
	•	router_decision は
options.include_router_decision = true のときのみ返却。
	•	MVP v1.0 では can_auto_switch は必ず false。
→ 「提案カードを出すだけ」で、自動切替はしない。
	•	diagnostics は UI には出さない前提の内部データ。

⸻

4. Safety / OS 一貫性ルール
	1.	計算専用 API

	•	このエンドポイントは 計算と判定だけ を行い、
送金・決済・ルート変更の実行は行わない。
	•	実行は常に別レイヤー／別サービス。

	2.	床／RED 判定

	•	floor_status_after = "RED" のとき：
	•	C：PRODUCT 側では「強STOP寄りの UI」を推奨。
	•	本 API 自体は「止める権限」を持たず、signal だけ返す。

	3.	AUTO_AURORA_ROUTER との整合

	•	router_decision 内で計算される saving / user_gain / lumi_fee は
AUTO_AURORA_ROUTER 仕様に従う：
	•	saving > 0 のときだけ lumi_fee > 0
	•	user_gain >= 0 を必須
	•	user_total_cost <= before_cost を保証

	4.	禁止領域

	•	本 API 内では：
	•	貸付
	•	預かり
	•	レバレッジ
	•	投資一任
などの機能を一切実装しない。

⸻

5. Priority Rationale（採択理由：HQ最終）
	1.	LUMI OS の心臓そのもの
	•	state_t + action_t → state_{t+1} の姿をそのまま API にしており、
他すべて（ダッシュボード／提案／ループ判定）がこの1本から派生可能。
	2.	全クラス共通の参照点
	•	C：PRODUCT：delta_gap / safety_gap / floor_status / zone を UI に使える
	•	D：GTM：LUMI 利用前後の安全度の変化をストーリー化できる
	•	A：HQ：OSが壊れていないかを検査する“窓”として機能
	3.	A：CORE の「抜かないルール」と非衝突
	•	計算／見える化に特化し、
	•	実行・レバレッジ・助言には一切踏み込まない。


