# spec/openai/ — Canonical Spec (OpenAI)

このディレクトリは **LUMINA BULIGE 側の「正本（canonical）」**です。  
ベンダー由来の原本（evidence）ではなく、**運用・差分比較・検査（DoD）に耐える形に整えた仕様**を置きます。

---

## 0. 用語（混線防止）

- **canonical（正本）**: LUMINAの運用仕様。比較しやすい形に整形・注記・ルール付与済み。
- **evidence（根拠/原本）**: ベンダー由来の生データ。加工しない（もしくは加工は別ファイルで明示）。

> 原則：**「根拠は evidence」「運用は canonical」**  
> 例外：ゼロ。迷ったら evidence に寄せる。

---

## 1. 置くもの（このフォルダに置くもの）

- `OpenAI.json`  
  - LUMINA運用に合わせた **比較対応版**（注記・禁止事項・DoD・変更手順に対応）
  - “改ざん検知の設計” を前提に、**真実性の主張や保証表現を入れない**
- `README.md`（このファイル）
- `changelog.md`（推奨）
  - 変更理由／差分概要／影響範囲（IFの変更点）を短く記録

---

## 2. 置かないもの（禁止）

- OpenAIの **原本そのまま**（それは `spec/evidence/vendor/openai/`）
- APIキー、Secrets、トークン、アカウントID等の機微情報
- 実装コード（ここは仕様板。実装は別）

---

## 3. 対になる evidence（根拠置き場）

OpenAI由来の原本（生）はこちら：

- `spec/evidence/vendor/openai/`
  - `openai.original.json`（取得したまま）
  - `SOURCE.md`（取得元URL/日時/取得者/取得方法）
  - `SHA256.txt`（原本ハッシュ：改ざん検知のため）

Opus由来の原本（生）はこちら：

- `spec/evidence/vendor/opus/`
  - `opus.original.json` など同様

---

## 4. 変更ポリシー（OSL準拠）

### 憲法ロック（不変）
- Proof = 改ざん検知（真実性は主張しない）
- Verify = 第三者検証のUI（判断主体ではない）
- 断定しない／保証しない
- 判断・承認は人間（Admin/Control）に集約
- 将来の規制強化を前提に設計する

> ここ（spec）でやるのは「証拠化・検査可能化」。  
> “正しさ” を断言しない。

---

## 5. 差分比較の基本運用（最短ルート）

### ルール
1. **原本は evidence** に固定（編集しない）
2. **canonical は運用に耐える形へ整形**
3. 差分は `changelog.md` に短く残す（理由・影響・対応）

### KPIの置き方（遅延より“在庫”）
- KPIは「遅延計測」よりも：
  - 仕様在庫化（どのIFが存在するか）
  - 逸脱検知（原本⇄正本⇄実装のズレ）
  - 変更記録（いつ・誰が・なぜ）
に寄せる

---

## 6. DoD（Definition of Done）

この canonical を変更したら最低限これを満たす：

- [ ] evidence の原本が存在し、SOURCE/ハッシュが揃っている
- [ ] canonical `OpenAI.json` が更新されている（整合）
- [ ] `changelog.md` に差分理由が1行でも残っている
- [ ] 秘密情報が混入していない

---

## 7. 注意（法務・倫理の誤解防止）

- 「保証」「合法」「確実」「安全」等の断定語は避ける  
- “防げる” ではなく “検知できる/証拠化できる” を優先  
- Verify/UI は判断を代替しない（判断主体を奪わない）

---

## 8. 関連

- OSL: `spec/osl/`
- Evidence: `spec/evidence/vendor/openai/`, `spec/evidence/vendor/opus/`
