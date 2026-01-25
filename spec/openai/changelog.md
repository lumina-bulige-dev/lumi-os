# OpenAI canonical 差分ログ

> Proofは改ざん検知のための記録であり、真実性の断定や保証を行いません。

## 変更ログ

### 2024-01-15: 初期取り込み
- **Vendor原本**: `spec/evidence/vendor/openai/OpenAI.json`
- **Canonical**: `spec/openai/OpenAI.json`

#### 差分要約（説明可能性）
- canonicalはvendor原本に対し、**改ざん検知のためのメタデータ**（`based_on_vendor_sha256`、`canonicalization_notes`、`required`）を追加。
- vendor原本の内容は保持しつつ、**在庫化/逸脱検知**に必要な管理情報のみを追加。
- 断定/保証は行わず、Admin/Controlの判断対象とする。

#### 証跡（sha256）
- vendor原本: `dc18606a048cf0887c5f7dc9a52f8d9d74c3ba000c1ee6ead4f0a22460c66627`
- canonical: `dd938f34bc498b85264451f3835eb3ee79d058c79a004e4c9a65a2403208fb09`
