# OSL適用範囲と優先順位

本READMEはOSL（Operating Specification Lock）の適用範囲、優先順位、禁止/制約の明文化を行い、OSLを最上位仕様として固定するための運用ルールを示します。

## 優先順位（憲法ロック）
1. `spec/osl/*`（最上位仕様）
2. `spec/openai/OpenAI.json`（canonical）
3. `spec/evidence/vendor/openai/*`（vendor原本）

> ここに反する生成・整理・移動は一切禁止です。

## OSL適用範囲
- OSLは**全仕様・全実装**に対して上位制約として適用されます。
- 具体的な禁止/制約は `spec/osl/OSL.md` から抽出し、以下に明文化します。

## 禁止/制約（OSLから抽出）
- `spec/osl/*` の削除・移動・名前変更は禁止。
- `spec/openai/OpenAI.json`（canonical）と `spec/evidence/vendor/openai/*`（vendor原本）の混在は禁止。
- Proofは改ざん検知のみに使用し、真実性の断定や保証を行わない。
- Verifyは第三者検証UIであり、判断主体として扱わない。
- 判断・承認は人間（Admin/Control）のみが行う。
- 将来の規制強化を前提とした保守可能性を確保する。

## KPI（運用目的）
- **Inventory**: endpoint/spec/ポリシーの存在を固定。
- **Drift**: OSL/Canonical/実装のズレを検知。
- **Change-log**: 変更理由と影響を記録。

## DoD（Definition of Done）検査項目
- OSLが存在し、上位制約として参照されている。
- canonicalが存在し、evidenceと分離されている。
- 変更履歴が残っている。
- info/gate→app/api redirect混線ゼロ（運用DoD）。
