# spec/ — Canonical Map (LUMINA BULIGE)

この `spec/` は「正本（canonical）」と「原本（evidence）」と「上位ロック（OSL）」を分離し、
増えても迷子にならないための“参照点”です。

---

## 優先順位（絶対）
1. **OSL（憲法ロック）**: `spec/osl/*`
2. **Canonical（運用仕様の正本）**: `spec/openai/OpenAI.json`
3. **Evidence（原本・根拠／改変しない）**: `spec/evidence/vendor/*`

> OSLに反する仕様は canonical に採用しない。  
> Evidence は「真実性」ではなく「出どころと改ざん検知」のための保管庫。

---

## Canonical（正本＝運用仕様）
- OpenAI: `spec/openai/OpenAI.json`  ← **唯一の正本**
- Opus（運用ルール）: `spec/opus/README.md`

---

## Evidence（原本＝根拠、改変しない）
- OpenAI由来: `spec/evidence/vendor/openai/`
- Opus由来: `spec/evidence/vendor/opus/`

---

## OSL（憲法ロック：機械可読／運用）
- `spec/osl/` 配下は上位ロック（最優先）
- 例: `spec/osl/osl.policy.v0.1.json` / `spec/osl/OSL.md` / `spec/osl/README.md`

---

## KPI（遅延より、在庫・逸脱・変更記録）
- Inventory: 何が存在するか（正本・原本・上位ロック）を固定
- Drift: OSL / canonical / 実装のズレ（逸脱）を検知
- Change-log: 変更理由と影響範囲を記録

---

## DoD（このspecが“効いてる”判定）
- canonical が1本に固定されている（複製しない）
- evidence は vendor 由来で分離されている（混ぜない）
- OSL が最上位として参照されている（後付け扱いにしない）
