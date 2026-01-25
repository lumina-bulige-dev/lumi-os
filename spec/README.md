# Spec Canonical Map

本ディレクトリはOSL（Operating Specification Lock）を最上位として、canonical/evidenceの分離と差分運用（在庫化・逸脱検知・変更記録）を可能にするための地図です。

## 優先順位（憲法ロック）
1. `spec/osl/*`（最上位仕様）
2. `spec/openai/OpenAI.json`（canonical）

> `spec/osl/*` は憲法ロックであり、ここに反する生成・整理・移動は一切禁止です。

## Canonical（唯一の正本）
- OpenAI canonical: `spec/openai/OpenAI.json`

## Evidence（vendor原本・証跡）
- OpenAI vendor evidence: `spec/evidence/vendor/openai/*`
- Opus vendor evidence: `spec/evidence/vendor/opus/*`

## 運用方針
- canonicalは1本に固定し、vendor evidenceと混在させません。
- Proofは改ざん検知のための記録であり、真実性の断定や保証を行いません。
- Verifyは第三者検証UIであり、判断主体ではありません。
- 判断/承認は人間（Admin/Control）が行います。

## DoD（Definition of Done）
- OSLが最上位として明記されている。
- canonicalが1本に固定されている。
- evidenceがvendor由来で分離されている。
