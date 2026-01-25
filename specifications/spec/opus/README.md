# Opus Spec — README (Canonical)

## 目的（Why）
Opus は「訓練・試行錯誤・失敗許容」を前提にした運用系AI/ツール群の位置づけ。
LUMINA BULIGE では **OSL（憲法ロック）**を上位に置き、Opus はその下で
- 変更を生む（試す）
- 差分を出す（可視化）
- 逸脱を検知する（監査）
ために使う。

> 重要：Opus は正しさの保証装置ではない。  
> ここでの Proof は「改ざん検知」であり「真実性」ではない。  
> Verify は第三者検証のUIであり、判断主体ではない。

---

## リポジトリ上の“置き場”ルール（Where）
この repo では **仕様（canonical）**と **根拠（evidence）**を分離する。

### Canonical（仕様の正本）
- `spec/openai/OpenAI.json`  
  OpenAI利用に関する **比較対応版**（こちらが “正本”）

- `spec/osl/*`  
  憲法ロック（機械可読/運用）

### Evidence（ベンダー原本の保管）
- `spec/evidence/vendor/openai/*`  
  OpenAI 由来の原本（取得したままの状態で保管）

- `spec/evidence/vendor/opus/*`  
  Opus 由来の原本（取得したままの状態で保管）

> Evidence は「根拠の保存」。  
> Canonical は「運用に使う仕様」。  
> どちらが上か迷ったら **Canonical が上**。

---

## Opus evidence の命名（How）
Opus 由来の原本は以下の命名を推奨：

- `spec/evidence/vendor/opus/OpusAI.json`
- `spec/evidence/vendor/opus/<yyyy-mm-dd>_OpusAI.json`
- `spec/evidence/vendor/opus/<source>_<yyyy-mm-dd>.json`

### 必須メタ（原本の先頭 or 同階層に *.meta.json）
最低限これを残す：
- `retrieved_at`（取得時刻）
- `retrieved_by`（取得者/ツール）
- `source`（取得元URL or 取得元識別子）
- `hash_sha256`（原本のSHA-256）
- `notes`（任意：取得の背景）

---

## 差分運用（Diff First）
Opus の価値は「新規作成」ではなく、**差分**で出す。

### 基本フロー
1. Evidence を置く（原本保管）
2. Canonical を更新する（運用仕様）
3. 差分をレビューする（逸脱/拡張/禁止を判断）
4. `spec/openai/changelog.md` に“変更理由”を残す

---

## “教える時の書き方”ルール（あなたの要望）
「Opus AI.json を説明する時は、vendorを外に書いて、これの為にコードを入れて」

→ これで固定する：

- Opus 由来の原本は **必ず** vendor 配下で明示する  
  `spec/evidence/vendor/opus/OpusAI.json`

- 説明文では “canonicalではない” を必ず一言入れる  
  例：
  - 「これは **根拠（evidence）**。仕様の正本は別（canonical）。」

---

## DoD（Definition of Done：合格条件）
- [ ] Opus原本が `spec/evidence/vendor/opus/` に保存されている
- [ ] 原本の取得メタ（timestamp/source/hash）が残っている
- [ ] canonical（仕様）を更新した場合、差分が説明できる
- [ ] OSL に反しない（反するなら Block/Quarantine/Kill のいずれかに収束）

---

## 注意（Legal / Ethics）
- Opus は判断主体にならない（意思決定は人間）
- 誘導線事故を作らない（info/gate は“理解”であって“誘導”ではない）
- 将来の規制強化を前提に運用する
