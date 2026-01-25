# OSL Policy Spec — README (Canonical)
**OSL = Operating Safety Layer**  
LUMINA BULIGE の「憲法ロック」を **機械可読なポリシー** として固定し、  
下流（info / gate / verify / app / api / admin / evidence）を **混線させない** ための上位仕様。

---

## 0. OSLの役割（何故）
OSL は「方針の文章」ではなく **運用上の“制約エンジンの入口”**。

- Proof = 改ざん検知（真実性の主張ではない）
- Verify = 第三者検証UI（判断主体ではない）
- 断定・保証をしない（合法性・正しさ・結果を約束しない）
- 判断・承認は人間のみ（Admin/Controlに集約）
- 将来の規制強化を前提に設計する

これを “ルールとして固定” することで、
会話・気分・流行・AIのノリで **仕様がズレる事故** を止める。

---

## 1. ディレクトリの正本（canonical）
このディレクトリが OSL の正本。

- `spec/osl/README.md`（この文書：運用説明）
- `spec/osl/osl.policy.v0.1.json`（ポリシー本体：機械可読）

**NOTE**：evidence（根拠）はここに置かない。  
evidence は `spec/evidence/` 配下。

---

## 2. OSLの基本思想（“安全は遅延じゃない”）
KPI は「遅延計測」ではなく、以下に寄せる：

1) **在庫化**：ポリシーと根拠が保存され参照できる  
2) **逸脱検知**：禁止・許可の逸脱が検知できる  
3) **変更記録**：いつ・なぜ変えたかが残る

遅延は「観測できたら便利」だが、OSLの主目的ではない。

---

## 3. ポリシー例（あなたの v0.1 の読み解き）
例：
- `INFO_NO_WRITE`：info は読むだけ（POST/PUT/PATCH/DELETE を拒否）
  - enforcement: `waf`（WAFで落とす）
  - risk: `M`（中：誤作動すると運用が止まる可能性があるため慎重に）

- `INFO_NO_EXTERNAL_NAV`：info から外部サイトへ遷移させない
  - enforcement: `ui`（リンク制御） + `csp`（ブラウザ側制約）
  - risk: `M`

この2本が “GAFA➗1000” の骨格。

---

## 4. 適用レイヤ（どこで効かせるか）
OSL は「単独で完結」しない。必ず複数レイヤで重ねる：

- UI：外部リンク無効、誘導線事故の防止
- CSP：外部へ出ない（connect/img/script等の制限）
- WAF：禁止メソッド遮断、既知パス保護
- Repo運用：canonical と evidence を分離
- DoD：毎回同じ検査で “混線ゼロ” を保証（※保証ではなく検査）

---

## 5. DoD（Doneの定義：毎回これだけ確認）
### info（運用DoD：混線検査）
- `https://info.luminabulige.com/`
- `https://info.luminabulige.com/literacy.html`
- `https://info.luminabulige.com/jp/33-okayama/gate-info/summary.html`

判定：
- 301/302 の混線なし
- 404 なし
- info/gate から app/api に飛ばない
- 外部遷移なし（クリックしても遮断される）

---

## 6. 変更ルール（勝手に増やさない）
OSL を変えるのは「最終手段」。理由は単純で、
上位が動くと **全部が再検証になる**。

変更する場合は必ず：
- `osl_policy_version` を上げる
- 変更理由を `changelog.md`（あるいはPR本文）に残す
- DoD を再実行し、結果を証跡として残す（スクショでも可）

---

## 7. OSL と他仕様の関係（順序）
上から順に強い（逆流禁止）：

1. OSL（憲法ロック：spec/osl）
2. canonical specs（採用仕様：spec/openai 等）
3. evidence（原本・根拠：spec/evidence/vendor/*）
4. 実装（Workers / Pages / App / Admin）

---

## 8. 次にやること（最短）
- まず `spec/osl/osl.policy.v0.1.json` を **OSLとして固定**
- 次に `spec/openai/README.md` を作って
  - canonical（採用仕様）と evidence（原本）の関係を明文化
- その後に codex（ワンちゃん🐶）を走らせて “差分訓練” を回す
