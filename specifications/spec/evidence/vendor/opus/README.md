# spec/evidence/vendor/opus/ — Evidence (Vendor Original / Opus)

ここは **Opus 由来の“原本（evidence）”置き場**です。  
LUMINA 側の運用仕様（canonical）ではなく、**ベンダー由来の取得物を「改ざん検知・監査・差分比較」のために保管**します。

---

## 0. このフォルダの立ち位置（超重要）

- **evidence = 根拠 / 原本（ベンダー由来）**
- **canonical = 仕様 / 運用（LUMINA 側）**

> 原則：**evidence は “そのまま保存”**  
> 加工・整形・追記は canonical 側でやる。

---

## 1. 置くもの（最小セット）

この配下に、最低限これを置く：

- `opus.original.json`
  - Opus 由来の **取得物そのまま**
  - ファイル名は固定推奨（比較・自動検査しやすい）
- `SOURCE.md`
  - 取得元・取得方法・取得日時・取得者・補足（コピペ流用できる形）
- `SHA256.txt`
  - 原本ファイルの SHA256 を1行で保存（改ざん検知）

必要に応じて：

- `notes.md`（任意）
  - “この原本は何のための根拠か” を短く。判断はしない。

---

## 2. 禁止（やらないこと）

- 原本 JSON を編集して上書きしない（**改ざん疑義の温床**）
- canonical（仕様）をここに置かない
- Secrets / APIキー / トークン / 個人情報を混入させない

---

## 3. 命名ルール（推奨）

- 原本：`opus.original.json`
- 取得時点のスナップが複数あるなら：
  - `opus.original.2026-01-24.json` のように日付付きも可
  - ただし **最新の正本は常に `opus.original.json` に寄せる**（差分比較が楽）

---

## 4. SOURCE.md テンプレ（そのまま使える）

以下の内容で `SOURCE.md` を作る：

## Source
- Vendor: Opus
- Artifact: opus.original.json
- Retrieved at: YYYY-MM-DDTHH:mm:ss+09:00
- Retrieved by: <name/role>
- Retrieval method:
  - URL:
  - Steps:
- Notes:
  - （取得時の注意点、版、画面キャプ有無など）

---

## 5. SHA256.txt の作り方

### macOS / Linux
shasum -a 256 opus.original.json

### Windows (PowerShell)
Get-FileHash .\opus.original.json -Algorithm SHA256

出たハッシュを `SHA256.txt` に **1行で**貼る。

---

## 6. canonical との対応関係

- evidence（ここ）: `spec/evidence/vendor/opus/opus.original.json`
- canonical（仕様）: `spec/openai/` や `spec/opus/`（※あなたの設計次第）

> 今回のあなたの整理は正しい：  
> **`spec/evidence/vendor/openai/` は OpenAI 原本**  
> **`spec/evidence/vendor/opus/` は Opus 原本**

---

## 7. DoD（このフォルダの完成条件）

- [ ] opus.original.json が存在する
- [ ] SOURCE.md が存在する（取得元・取得方法・日時が書かれている）
- [ ] SHA256.txt が存在する（原本のハッシュが一致する）
- [ ] 機微情報が混ざっていない
