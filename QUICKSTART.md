# LUMI OS Quick Start Guide
# LUMI OS クイックスタートガイド

Get started with LUMI OS in 5 minutes.

5分でLUMI OSを始められます。

---

## Prerequisites / 前提条件

- Node.js v20+ / Node.js v20以降
- npm v9+ / npm v9以降
- Git

---

## Quick Setup / クイックセットアップ

### 1. Clone & Install / クローン & インストール

```bash
# Clone the repository
git clone https://github.com/lumina-bulige-dev/lumi-os.git
cd lumi-os

# Install dependencies
npm install
```

### 2. Start Development / 開発開始

```bash
# Start the Next.js dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

### 3. Build for Production / プロダクション用にビルド

```bash
# Build static site
npm run build

# Start production server
npm run start
```

---

## Working with API / APIを使った作業

```bash
# Navigate to API directory
cd lumi-core-api

# Install API dependencies
npm install

# Start local development
npx wrangler dev

# Deploy to Cloudflare Workers
npm run deploy
```

---

## Common Commands / よく使うコマンド

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server<br>開発サーバーを起動 |
| `npm run build` | Build for production<br>プロダクション用にビルド |
| `npm run start` | Start production server<br>プロダクションサーバーを起動 |

---

## Project Structure / プロジェクト構造

```
lumi-os/
├── app/              # Next.js pages
├── lumi-core-api/    # Cloudflare Workers API
├── rules/            # System rules
├── specifications/   # Specifications
├── protocols/        # Protocols
└── db/              # Database schemas
```

---

## Need Help? / ヘルプが必要ですか？

See the full [DEVELOPMENT.md](./DEVELOPMENT.md) guide for detailed instructions.

詳細な手順については、[DEVELOPMENT.md](./DEVELOPMENT.md)ガイドを参照してください。

---

## Key Principles / 重要な原則

1. **Only A:HQ** can modify OS rules<br>**A:HQのみ**がOSルールを変更可能
2. **lumi-os** is the single source of truth<br>**lumi-os**が唯一の情報源
3. Respect class boundaries (A/B/C/D/E)<br>クラス境界を尊重（A/B/C/D/E）

---

**Next Steps / 次のステップ:**

- Read [README.md](./README.md) for project overview / プロジェクト概要
- Read [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed setup / 詳細なセットアップ
- Check [RESPONSIBILITY.md](./RESPONSIBILITY.md) for ownership map / 所有権マップ

---

Last Updated: 2026-01-10 | Version: 1.0.0
