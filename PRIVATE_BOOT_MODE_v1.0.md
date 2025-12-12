PRIVATE_BOOT_MODE v1.0

（Private Boot = ON/OFF 統治）

0. Purpose

LUMI OS の初期化・再編・危機対応の期間において、
外部公開・拡散・越境開発を防ぎ、OSの一貫性と安全を守る。

1. Modes
	•	BOOT_MODE = ON：Private Boot 期間（保護モード）
	•	BOOT_MODE = OFF：通常運用

2. Rules when BOOT_MODE = ON
	•	公開（LP/広告/SNS/外部共有）を行わない
	•	新規仕様（spec/rules/protocols）の追加は A：HQ の採択のみ
	•	B/C/D は「実装・制作」を開始しない（参照・準備のみ）
	•	変更は E（源泉）→ A（整形/採択）→ G（履歴） の順で流す
	•	“迷ったら止める” を正とする

3. Rules when BOOT_MODE = OFF
	•	通常のクラス運用に戻る
	•	ただし 正本は常に lumi-os を唯一の根拠とする

4. Exit Criteria（ON → OFF）

次の条件が揃ったとき、A：HQ は OFF を宣言できる：
	•	A-CORE 正本（憲法／クラスモデル／主要spec）がヘッダー付きで揃っている
	•	BのMVP API（最小セット）が貫通している（/core/home_state 等）
	•	Dの外向けコピーが禁区を踏んでいない（F：GOV 監査済）
