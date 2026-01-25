# OpenAI canonical 位置づけ

本ディレクトリは `spec/openai/OpenAI.json` を**canonical**として保持します。canonicalは在庫化・逸脱検知・変更記録を目的とした**管理用正本**であり、真実性の断定や保証を行いません。

## 構成
- `spec/openai/OpenAI.json`: canonical（管理用正本）
- `spec/evidence/vendor/openai/*`: vendor原本（証跡）

## 運用方針
- canonicalはvendor原本と**分離**し、混在させません。
- Proofは改ざん検知のための記録であり、判断主体ではありません。
- Verifyは第三者検証UIであり、判断主体ではありません。
- 判断/承認は人間（Admin/Control）が行います。

## 差分管理
- 差分や変更理由は `spec/openai/changelog.md` に記録します。
- sha256などのハッシュを用いて改ざん検知の証跡を残します。
