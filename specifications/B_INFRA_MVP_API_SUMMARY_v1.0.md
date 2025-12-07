# B-INFRA / MVP_API_SUMMARY_v1.0

※本ドキュメントは A：CORE 憲法の参照用。正本は A：CORE／lumi-os に従う。  
created by LUMINABULIGE

---

## 0. A：HQ 決定

本ドキュメント `B-INFRA / MVP_API_SUMMARY_v1.0` を、MVP 期における  
B：INFRA の API 範囲と実装方針の「正」とする。

---

## 1. MVP で扱う API 範囲（B-INFRA）

MVP フェーズの B-INFRA が守るべき HTTP API は、以下の **4 本のみ** とする。

1. `GET  /api/v1/core/home_state`  
2. `POST /api/v1/os/reaction`  
3. `POST /api/v1/goal/buffer`  
4. `GET  /api/v1/links/wise`

この 4 本以外の API を追加・変更する場合は、必ず A：HQ で  
「5 本目以降」としての必要性をあらためて審議し、採択されたものだけを  
正式 API として扱う。

---

## 2. /api/v1/core/home_state の方針

- `home_state` では、A：HQ が別途定義したサンプル JSON をベースに、  
  **HOME_v1.0 で必要な値をすべて 1 本で返す** ことを目的とする。
- 他のエンドポイントや別ソースに同じ値を分散させない。  
  HOME 画面に必要な state は、まずこの API から取得される構造に寄せていく。

---

## 3. safe_move_limit の正規化ルール

- `safe_move_limit` は **必ず 0 以上** の数値のみを返す。  
- 内部計算の結果が負の値になった場合でも、レスポンスを返す前に  
  **0 に丸めてから** C：PRODUCT に返却する。
- C 側は「`safe_move_limit` が負になるケースは存在しない」前提で実装してよい。

---

## 4. /api/v1/links/wise の扱い

- Wise の referral URL は、**B-INFRA 側で一元管理** する。  
- C：PRODUCT は `GET /api/v1/links/wise` のレスポンスをそのまま利用し、  
  URL の中身・構造・環境差分（dev/stg/prod 等）には立ち入らない。
- Wise 収益ポリシー（ユーザー不利にしないこと）は、  
  A：HQ が別途定めた `WISE_REVENUE_POLICY` に従う。

---

## 5. 実装指示（B-INFRA）

本サマリを前提として、MVP 着手時点では次を優先実装とする。

1. `GET /api/v1/core/home_state`  
2. `GET /api/v1/links/wise`

- いずれも、A：HQ が定めた canonical spec（HOME_v1.0・MVP_API_POLICY・  
  MVP_API_REACTION など）に整合する形で実装すること。
- `POST /api/v1/os/reaction` および `POST /api/v1/goal/buffer` は、  
  定義済みの canonical spec に従い、段階的に心臓部ロジックを移植していく。

---

## 6. 境界ルールの再確認

- B：INFRA は、本ドキュメントに記載された **4 本以外の API を  
  MVP フェーズでは自発的に増やさない**。
- C：PRODUCT は、HOME 画面に必要な値を原則として  
  `GET /api/v1/core/home_state` と `GET /api/v1/links/wise` から取得し、  
  金融ロジックや安全判定の再計算は行わない。
- A：HQ は、API の増減や仕様変更が必要になった場合、  
  まず本サマリを更新し、それに従って B / C の実装範囲を調整する。
