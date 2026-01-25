# Opus vendor evidence 運用ルール

本ディレクトリはOpusのvendor evidenceを参照するための運用ルールを定義します。canonicalは作成せず、vendor原本を証跡として分離維持します。

## 位置づけ
- Proofは改ざん検知のための記録であり、真実性の断定や保証を行いません。
- Verifyは第三者検証UIであり、判断主体ではありません。
- 判断/承認は人間（Admin/Control）が行います。

## Evidence
- `spec/evidence/vendor/opus/*`

## 運用ルール
- vendor evidenceは削除・移動・名前変更を禁止します。
- canonical/evidenceの混線を防止します。
