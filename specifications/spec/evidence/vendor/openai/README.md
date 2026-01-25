---

## 3. 命名規約（迷子防止の“憲法”）
### 3.1 原本ファイルは必ず `*.original.*`
**原本の名前はブレさせない**（差分・監査・訓練が死ぬため）。

例：
- `openai/openai.original.json`
- `opus/opus.original.json`
- `cloudflare/api-shield.original.md`（将来）
- `openai/policy.original.pdf`（将来）

### 3.2 仕様っぽい名前を evidence に置かない
Evidence に `OpenAI.json` / `OSL.json` のような **“正本に見える名前”は禁止**。  
それは `spec/<domain>/` の責務。

---

## 4. 追加するときの最小セット（テンプレ）
ベンダー証拠を追加したら、最低限この3つをそろえる：

1) 原本（必須）
- `*.original.*`

2) 取得メタ（推奨：テキストで残す）
- `source.txt`（URL、取得日、取得者、取得方法、対象版）
- 例：
  - URL
  - 取得日時（JST / UTC）
  - 取得経路（ブラウザ/CLI/API）
  - 取得対象（ページ名、バージョン、コミット）

3) 改ざん検知用ハッシュ（推奨）
- `sha256.txt`
- 例：`sha256sum openai.original.json > sha256.txt`

---

## 5. 差分比較の原則（KPI をここに寄せる）
この運用のKPIは **遅延計測ではなく** 次の3つです：

- **在庫化**：何を原本として保存しているか（Evidence inventory）
- **逸脱検知**：正本（Canonical）が原本からどう逸脱したか（Diff）
- **変更記録**：いつ、誰が、何を、なぜ変えたか（Changelog）

> 目標：**「仕様を変えたら必ず差分と記録が残る」** を自動化すること。

---

## 6. 変更手順（ルール）
Evidenceを増やすのは自由。ただし **Canonical を変えるときは必ず Evidence が先**。

**順番：**
1. Evidence に原本を追加（`*.original.*`）
2. Diff を確認（原本 ↔ 仕様）
3. Canonical 側（`spec/<domain>/`）を更新
4. 変更理由を `spec/<domain>/changelog.md` に残す

---

## 7. 禁止事項（Do Not）
- Evidence を “正本” として参照し、運用判断に使う
- 原本ファイル名を毎回変える（監査・比較不能化）
- vendor を跨いで混在させる（openai と opus を同じフォルダへ置く等）
- “保証/合法/正しい” を示す目的で evidence を使う（誤解の温床）

---

## 8. このフォルダの「Done」定義（DoD）
- vendorごとに分離されている
- 原本が `*.original.*` で保存されている
- source.txt（または同等メタ）がある
- sha256（または同等の改ざん検知）がある
- Canonical 更新時に changelog が残っている

---

## 9. 例：OpenAI と Opus を並べる（正しい形）
