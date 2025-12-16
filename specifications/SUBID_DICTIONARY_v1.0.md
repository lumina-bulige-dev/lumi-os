🔔A-CORE / CANONICAL SPECIFICATION

SUBID_DICTIONARY_v1.0

※本ファイルは A：HQ 管理下の正本である。
B／C／D／E／F／G は参照のみとし、
SubID の命名・追加・変更は A：HQ のみが行う。

If it is not in lumi-os, it is not official.
SUBID_DICTIONARY_v1.0

Partnerize / Wise 計測用 SubID 正式辞書（Canonical Draft）

※本ドキュメントは A：HQ 管理下。
B／C／D は 参照のみ。命名・変更は A のみが行う。

⸻

0. Purpose（目的）

本辞書は、Wise（Partnerize）送客における 成果計測の唯一の共通語彙として、
SubID（参照タグ）の 命名ルール・短縮形・意味を固定する。

目的：
	•	計測ログが「読める」「集計できる」状態を将来まで維持する
	•	人が増えても、導線が増えても、分析が壊れないようにする

⸻

1. SubID 基本構造（圧縮版・正本）

{src}-{page}-{variant}-{campaign}

•	すべて 英小文字
	•	ハイフン - 区切り
	•	30〜40文字以内
	•	個人情報・自由記述は禁止

例：
	•	lp-home-a-wise
	•	blog-aufee-b-wise
	•	app-dashboard-a-wise

2. src（流入元）辞書
3. src
意味
lp
ランディングページ
blog
ブログ／記事
app
Web/App 内
sns
SNS（自然流入）
ad
広告
mail
メール
test
テスト用（本番では原則禁止）

3. page（ページID）辞書【最重要】

3.1 LP / App 共通

正式名称
page
トップ
home
ダッシュボード
dashboard
Aurora 比較
aurora
送金比較トップ
compare
FAQ
faq

3.2 ブログ／記事（短縮固定）

元スラッグ
page
au-transfer-fee
aufee
wise-fee-compare
wisecomp
jp-to-au-transfer
jpau
money-flow-basics
mflow

※ 新規記事を追加する場合
→ 必ず A：HQ がここに追記してから使用

⸻

4. variant（ABテスト）

variant
意味
a
デフォルト
b
ABテストB
c
ABテストC

※ ABしない場合は 常に a

5. campaign（固定）

campaign
意味
wise
Wise 送金
wise-jpy
Wise（JPY特化）※将来
wise-au
Wise（AU特化）※将来

6. 正式例（使用可能）
	•	LPトップ → Wise
lp-home-a-wise
	•	Appダッシュボード → Wise
app-dashboard-a-wise
	•	ブログ（豪ドル送金）→ Wise
blog-aufee-a-wise
	•	SNS（ABテストB）→ Wise
sns-home-b-wise

⸻

7. 禁止事項（重要）
	•	❌ 氏名・メール・ID・端末IDを含める
	•	❌ 日本語・絵文字
	•	❌ 自由記述（例：lp-home-good-wise）
	•	❌ 辞書未登録 page の使用

⸻

8. 運用ルール（絶対）
	1.	Wiseリンク直書き禁止
	2.	すべて /r/wise?sid={subid} 経由
	3.	SubID を変える判断は A：HQ のみ
	4.	分析は「SubID単位」で行う

⸻

9. Status
	•	Version: v1.0
	•	Status: Draft（A-CORE 採択待ち）
	•	Next: /rules または /specifications に正本化







