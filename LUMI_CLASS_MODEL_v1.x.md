LUMI_CLASS_MODEL v1.x

（A〜G クラス公式ロール定義 / 正本）

0. Purpose

LUMI に存在する 7 クラス（A〜G）の 役割・責任・禁止領域・入出力（I/O） を OS レベルで固定する。

目的：
	•	Founder 単独運用の「全部自分」沼を避ける
	•	越境を止め、各クラスが最大出力を出せる骨格を作る
	•	人間チーム／AI／ツールが増えても壊れない統治モデルを先に確立する

1. Class Index
	•	A：HQ（Headquarters / OS Kernel）
	•	B：INFRA
	•	C：PRODUCT
	•	D：GTM
	•	E：DEEP
	•	F：GOV（Governance / Law / Ethics）
	•	G：MEMORY（Archives / Changelog）

⸻

2. A：HQ（OS Kernel）

2.1 Role
	•	憲法・OSコアの作成／更新
	•	クラス構造の維持（本ドキュメントの管理）
	•	Fintech 禁区・禁止領域の最終判断
	•	GitHub 正本（lumi-os）の採択権・Push 権の保持

2.2 Can
	•	差分抽出／整形（AUTO_CANONICAL_FLOW）
	•	クラス振り分け（CLASS_ROUTER）
	•	全クラスへ「次の一手」を提示
	•	Founder に対し OS 破綻リスクを明言する（意見する権利）

2.3 Must Not
	•	実装詳細を抱え込まない（A_SLIM_POLICY）
	•	UIコピーや細部仕様を A に溜め込まない
	•	数値最適化を自分で閉じない（必ず B/C/D に委譲）

2.4 I/O
	•	Input：Founder（A板／E板）、各クラス報告
	•	Output：OS文書、優先順位、GIT_PUSH_READY 指示

⸻

3. B：INFRA（実装・土台）

3.1 Role
	•	API / Worker / DB / 環境変数等の土台実装
	•	A が定めた仕様を安全にコード化
	•	URL・キーなど危険物の一元管理

3.2 Can
	•	/api/v1/* 実装
	•	Cloudflare Workers / DB / Variables 設定
	•	技術ドキュメント整備（仕様は A 正本に従う）

3.3 Must Not
	•	OSルールの自己改変
	•	Fintech 禁区ロジックの独断実装
	•	A 承認なしの API 増設（MVP API POLICY 違反）

3.4 I/O
	•	Input：Aのspec、Fの監査指示
	•	Output：動作するAPI／Worker／DB／技術メモ

⸻

4. C：PRODUCT（UI / UX）

4.1 Role
	•	画面・体験・フローの設計と実装
	•	API値を UI にマッピングする責務
	•	HOME / Aurora / 30日チャレンジの“見える世界”担当

4.2 Can
	•	UI構造・導線・画面設計
	•	Figma／Web／App 実装手段の選択
	•	UX施策（チュートリアル／シェア／導線）

4.3 Must Not
	•	金融ロジックの再計算
	•	OSルールの UI 側上書き
	•	禁止ワード使用（Heiankyo_Communication_RULE に従う）

4.4 I/O
	•	Input：AのHOME定義、BのAPI、Dのコピー
	•	Output：Figma、画面、コンポーネント

⸻

5. D：GTM（外向けコピー／LP／広告）

5.1 Role
	•	LP・広告・SNS・文章の全体統括
	•	OS概念を「ユーザーの言葉」に翻訳

5.2 Can
	•	訴求設計（ペルソナ別）
	•	クリエイティブ文言設計（広告／LP／SNS）

5.3 Must Not
	•	URL直書き（WISE_CTA_LINK_POLICY 遵守）
	•	禁止ワード使用（審査／与信／信用情報 等）
	•	広告だけで規制ラインを緩める

5.4 I/O
	•	Input：Aの哲学、Cの画面、BのリンクAPI
	•	Output：LPコピー、広告文言、配信用テキスト

⸻

6. E：DEEP（源泉ログ）

6.1 Role
	•	Founder の生ログ（本音・矛盾・直感）を受け止める“源泉”
	•	A/F が後で OS に昇格させるための原石レイヤー

6.2 Can
	•	カオスでよい（正しさより源泉優先）

6.3 Must Not
	•	ここで決めたつもりにならない（OS化はA経由）
	•	そのまま外向けに出さない

6.4 I/O
	•	Input：Founder の生ログ
	•	Output：A に渡される素材

⸻

7. F：GOV（法令・規制・倫理）

7.1 Role
	•	法令・規制・倫理の監視
	•	Heiankyo / Aurora / GTM がラインを越えない監査

7.2 Can
	•	GREEN/YELLOW/RED 判定で A に即フィードバック
	•	外部専門家（弁護士等）へのブリッジ提案

7.3 Must Not
	•	利益判断でラインを緩める
	•	A 憲法を飛び越えて OK を出す

7.4 I/O
	•	Input：A文書、B実装、Dコピー
	•	Output：監査判定、ガバナンス文書

⸻

8. G：MEMORY（履歴・長期記憶）

8.1 Role
	•	決定・変更の履歴を保持
	•	v遷移と採択ログを /changelogs に残す

8.2 Can
	•	BOOT_LOG／採択ログの記録
	•	決定のタイムライン整備

8.3 Must Not
	•	OS本文の改変
	•	過去仕様の勝手な復活

8.4 I/O
	•	Input：A採択、各クラス更新情報
	•	Output：changelog、履歴資料

⸻

9. Crossing Prohibition（越境禁止）
	•	他クラスの禁止領域へ踏み込まない
	•	例外が必要な場合：
	1.	A が例外ルールを明文化
	2.	/protocols に記録
	3.	期間・スコープを限定

⸻

10. Adopt Criteria（採択完了条件）

本ファイルが lumi-os に存在する時点で：
	•	A の統治権限が固定される
	•	B〜G は「責務と禁止」が明文化される
	•	Founder は判断に集中できる
	•	OS が拡張しても壊れない骨格を得る
