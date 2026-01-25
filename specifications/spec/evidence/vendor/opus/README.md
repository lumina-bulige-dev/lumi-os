# spec/evidence/vendor/README.md
# Vendor Evidence Vault — README (Canonical)

このディレクトリは **「根拠（Evidence）を保持する保管庫」** です。  
**仕様（Canonical）ではありません。**  
判断主体ではなく、あくまで **参照・比較・監査説明のための“証拠置き場”** として運用します。

---

## 0. 憲法ロック（このフォルダにも適用）
- Proof = 改ざん検知（真実性の主張ではない）
- Verify = 第三者検証のUI（判断主体ではない）
- Evidence は **保証・正しさの根拠ではなく**、「こうだった／こう書いてあった」を示す材料

---

## 1. 役割（最重要）
### Evidence（ここ）
- ベンダー提供物・原本・スクショ・PDF・引用元などの保存
- 差分比較の材料（原本 ↔ 仕様）

### Canonical（別場所）
- **仕様として従う**のは `spec/<domain>/` 側
  - 例：`spec/openai/OpenAI.json`
  - 例：`spec/osl/osl.policy.v0.1.json`

> つまり：**evidence は根拠置き場 / canonical は仕様置き場**  
> evidence を更新しても「運用仕様が変わった」扱いにはしない。

---

## 2. ディレクトリ規約（vendor 分離）
ベンダーごとに分けます。混在禁止。
