# spec (Canonical Map)

このディレクトリは「仕様（canonical）」と「根拠（evidence）」を分離して管理する。

## Canonical（正本＝運用仕様）
- OpenAI: spec/openai/OpenAI.json
- OSL: spec/osl/osl.policy.v0.1.json（機械可読） / spec/osl/README.md（解説）
- Opus: spec/opus/README.md（運用ルール）

## Evidence（原本＝根拠、改変しない）
- OpenAI原本: spec/evidence/vendor/openai/
- Opus由来原本: spec/evidence/vendor/opus/

## Migration Tower（移行中の残骸）
- ここにないファイル/ルートは「移行途中」。削除は後回し（必要なら別PRで整理）。
