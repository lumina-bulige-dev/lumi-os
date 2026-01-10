# LUMI OS Development Setup Guide
# LUMI OS 開発環境セットアップガイド

This guide provides instructions for setting up a local development environment for the LUMI OS repository.

このガイドは、LUMI OSリポジトリのローカル開発環境をセットアップするための手順を提供します。

---

## Table of Contents / 目次

1. [Prerequisites / 前提条件](#prerequisites--前提条件)
2. [Repository Overview / リポジトリ概要](#repository-overview--リポジトリ概要)
3. [Quick Start / クイックスタート](#quick-start--クイックスタート)
4. [Project Components / プロジェクトコンポーネント](#project-components--プロジェクトコンポーネント)
5. [Development Workflows / 開発ワークフロー](#development-workflows--開発ワークフロー)
6. [Testing / テスト](#testing--テスト)
7. [Deployment / デプロイ](#deployment--デプロイ)
8. [Troubleshooting / トラブルシューティング](#troubleshooting--トラブルシューティング)

---

## Prerequisites / 前提条件

### Required Software / 必須ソフトウェア

- **Node.js**: v20.x or later / v20.x以降
- **npm**: v9.x or later (comes with Node.js) / v9.x以降（Node.jsに付属）
- **Git**: Latest stable version / 最新の安定版

### Optional Software / オプションソフトウェア

- **Docker**: For containerized development (not required) / コンテナ化された開発用（必須ではない）
- **wrangler**: Cloudflare Workers CLI (for API development) / Cloudflare Workers CLI（API開発用）

### Supported Operating Systems / サポートされているOS

- macOS (recommended) / macOS（推奨）
- Linux (Ubuntu 20.04+, Debian, Fedora) / Linux（Ubuntu 20.04+、Debian、Fedora）
- Windows 10/11 (with WSL2 recommended) / Windows 10/11（WSL2推奨）

---

## Repository Overview / リポジトリ概要

**lumi-os** is the canonical source of truth for LUMINA BULIGE's core operating system components.

**lumi-os**は、LUMINA BULIGEのコアOSコンポーネントの正式な情報源です。

### Repository Structure / リポジトリ構造

```
lumi-os/
├── app/                    # Next.js application pages and components
│                           # Next.jsアプリケーションのページとコンポーネント
├── lumi-core-api/          # Cloudflare Workers API
│                           # Cloudflare Workers API
├── lumi-os/                # Core OS definitions
│                           # コアOS定義
├── rules/                  # System rules and constraints
│                           # システムルールと制約
├── specifications/         # Official specifications
│                           # 公式仕様
├── protocols/              # Protocols and policies
│                           # プロトコルとポリシー
├── db/                     # Database schemas and migrations
│                           # データベーススキーマとマイグレーション
├── diagrams/               # Architecture diagrams
│                           # アーキテクチャ図
├── integration/            # Integration documentation
│                           # 統合ドキュメント
├── package.json            # Root package configuration
│                           # ルートパッケージ設定
├── next.config.js          # Next.js configuration
│                           # Next.js設定
├── tsconfig.json           # TypeScript configuration
│                           # TypeScript設定
└── index.html              # Production landing page
                            # プロダクションランディングページ
```

### Key Components / 主要コンポーネント

1. **Next.js Web Application**: Main web interface (static export mode)
   **Next.jsウェブアプリケーション**：メインウェブインターフェース（静的エクスポートモード）

2. **lumi-core-api**: Cloudflare Workers backend API
   **lumi-core-api**：Cloudflare WorkersバックエンドAPI

3. **Core OS Documentation**: Rules, specifications, and protocols
   **コアOSドキュメント**：ルール、仕様、プロトコル

---

## Quick Start / クイックスタート

### 1. Clone the Repository / リポジトリをクローン

```bash
git clone https://github.com/lumina-bulige-dev/lumi-os.git
cd lumi-os
```

### 2. Install Dependencies / 依存関係をインストール

#### Main Application / メインアプリケーション

```bash
npm install
```

#### API (Cloudflare Workers) / API（Cloudflare Workers）

```bash
cd lumi-core-api
npm install
cd ..
```

### 3. Start Development Server / 開発サーバーを起動

#### Next.js Application / Next.jsアプリケーション

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

アプリケーションは `http://localhost:3000` で利用可能になります

**Note**: This project uses Next.js with static export mode (`output: "export"`), so server-side features like API routes are not available in the main application.

**注意**：このプロジェクトは静的エクスポートモード（`output: "export"`）でNext.jsを使用しているため、APIルートなどのサーバーサイド機能はメインアプリケーションでは利用できません。

#### API Development / API開発

```bash
cd lumi-core-api
npm run dev
# or with wrangler:
npx wrangler dev
```

---

## Project Components / プロジェクトコンポーネント

### 1. Next.js Web Application / Next.jsウェブアプリケーション

**Technology Stack / 技術スタック:**
- Next.js 14.x (Static Export Mode / 静的エクスポートモード)
- React 18.x
- TypeScript 5.x
- pdf-lib for PDF generation / PDF生成用

**Available Scripts / 利用可能なスクリプト:**

```bash
# Build the application for production
# プロダクション用にアプリケーションをビルド
npm run build

# Start production server (after build)
# プロダクションサーバーを起動（ビルド後）
npm run start

# Note: 'npm run dev' is not defined in package.json
# You may need to add it or use 'next dev' directly
# 注意：'npm run dev'はpackage.jsonで定義されていません
# 追加するか、'next dev'を直接使用する必要があります
```

**To add dev script / devスクリプトを追加する場合:**

Edit `package.json` and add to scripts section:
`package.json`を編集してscriptsセクションに追加：

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start"
}
```

### 2. Cloudflare Workers API (lumi-core-api)

**Technology Stack / 技術スタック:**
- Cloudflare Workers
- TypeScript
- Wrangler CLI

**Configuration / 設定:**

The API is configured in `lumi-core-api/wrangler.toml`:
APIは `lumi-core-api/wrangler.toml` で設定されています：

```toml
name = "lumi-core-api"
main = "src/index.ts"
compatibility_date = "2025-12-28"

routes = [
  { pattern = "api.luminabulige.com/*", zone_name = "luminabulige.com" }
]
```

**Available Scripts / 利用可能なスクリプト:**

```bash
cd lumi-core-api

# Deploy to Cloudflare Workers
# Cloudflare Workersにデプロイ
npm run deploy

# Local development with wrangler
# wranglerでローカル開発
npx wrangler dev

# View logs
# ログを表示
npx wrangler tail
```

**Authentication / 認証:**

To deploy, you need Cloudflare credentials:
デプロイするには、Cloudflareの認証情報が必要です：

```bash
# Login to Cloudflare
# Cloudflareにログイン
npx wrangler login

# Or set environment variables:
# または環境変数を設定：
export CLOUDFLARE_API_TOKEN=your_token
export CLOUDFLARE_ACCOUNT_ID=your_account_id
```

### 3. Database / データベース

**Database Schema / データベーススキーマ:**

SQL migration files are located in the `db/` directory:
SQLマイグレーションファイルは `db/` ディレクトリにあります：

```
db/
├── 001_core.sql         # Core tables
├── 002_events.sql       # Event tables
├── 003_rollups.sql      # Rollup tables
├── 004_views_cia.sql    # Views
├── 005_jobs.sql         # Job tables
└── 006_seed_reason_catalog.sql  # Seed data
```

**Note**: This repository contains SQL schemas but no database setup scripts. You'll need to:
**注意**：このリポジトリにはSQLスキーマが含まれていますが、データベースセットアップスクリプトはありません。必要に応じて：

1. Set up your preferred database (PostgreSQL recommended)
   好みのデータベースをセットアップ（PostgreSQL推奨）
2. Run migration files in order
   マイグレーションファイルを順番に実行
3. Configure connection strings in your environment
   環境で接続文字列を設定

---

## Development Workflows / 開発ワークフロー

### Working with Documentation / ドキュメントの作業

All canonical OS documentation is stored in:
すべての正式なOSドキュメントは以下に保存されています：

- `rules/` - System rules / システムルール
- `specifications/` - Technical specifications / 技術仕様
- `protocols/` - Protocols and policies / プロトコルとポリシー
- `lumi-os/` - Core OS definitions / コアOS定義

**Important**: Only A:HQ (Headquarters Layer) may modify these files.
**重要**：これらのファイルを変更できるのはA:HQ（本部層）のみです。

### Code Style / コードスタイル

The project uses TypeScript with the following configuration:
プロジェクトは以下の設定でTypeScriptを使用しています：

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "strict": false,
    "noEmit": true,
    "module": "ESNext",
    "moduleResolution": "Bundler"
  }
}
```

### Git Workflow / Gitワークフロー

```bash
# Create a feature branch
# フィーチャーブランチを作成
git checkout -b feature/your-feature-name

# Make changes and commit
# 変更を加えてコミット
git add .
git commit -m "Description of changes"

# Push to remote
# リモートにプッシュ
git push origin feature/your-feature-name

# Create a pull request on GitHub
# GitHubでプルリクエストを作成
```

---

## Testing / テスト

### Current Test Status / 現在のテスト状況

**Note**: This repository currently does not have a test suite configured.
**注意**：このリポジトリには現在テストスイートが設定されていません。

### Manual Testing / 手動テスト

#### Test Next.js Application / Next.jsアプリケーションをテスト

```bash
# Build the application
# アプリケーションをビルド
npm run build

# Test the production build
# プロダクションビルドをテスト
npm run start
```

Visit `http://localhost:3000` and verify functionality.
`http://localhost:3000` にアクセスして機能を確認してください。

#### Test API / APIをテスト

```bash
cd lumi-core-api

# Start local development server
# ローカル開発サーバーを起動
npx wrangler dev

# In another terminal, test endpoints:
# 別のターミナルでエンドポイントをテスト：
curl http://localhost:8787/your-endpoint
```

---

## Deployment / デプロイ

### Continuous Integration / 継続的インテグレーション

The repository uses GitHub Actions for CI/CD:
リポジトリはCI/CDにGitHub Actionsを使用しています：

**Workflow**: `.github/workflows/deploy-workers.yml`

Automatically deploys `lumi-core-api` to Cloudflare Workers when:
以下の場合に自動的に `lumi-core-api` をCloudflare Workersにデプロイします：

- Changes are pushed to `main` branch / `main`ブランチに変更がプッシュされた時
- Changes affect `lumi-core-api/**` files / `lumi-core-api/**`ファイルに影響する変更の時
- Workflow is manually triggered / ワークフローが手動でトリガーされた時

**Required Secrets / 必要なシークレット:**

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### Manual Deployment / 手動デプロイ

#### Deploy API / APIをデプロイ

```bash
cd lumi-core-api

# Deploy to production
# プロダクションにデプロイ
npm run deploy
# or
npx wrangler deploy --env production
```

#### Deploy Web Application / ウェブアプリケーションをデプロイ

The Next.js application is configured for static export:
Next.jsアプリケーションは静的エクスポート用に設定されています：

```bash
# Build static files
# 静的ファイルをビルド
npm run build

# Output will be in 'out/' directory
# 出力は 'out/' ディレクトリに生成されます

# Deploy to any static hosting service:
# 任意の静的ホスティングサービスにデプロイ：
# - Cloudflare Pages
# - Vercel
# - Netlify
# - AWS S3 + CloudFront
```

**Note**: The production landing page is served from `/index.html` (not the Next.js app).
**注意**：プロダクションのランディングページは `/index.html` から提供されます（Next.jsアプリではありません）。

---

## Troubleshooting / トラブルシューティング

### Common Issues / よくある問題

#### 1. Node Version Issues / Nodeバージョンの問題

**Problem**: Build fails with Node.js version errors
**問題**：Node.jsバージョンエラーでビルドが失敗する

**Solution**:
```bash
# Check your Node.js version
# Node.jsバージョンを確認
node --version

# Should be v20.x or later
# v20.x以降である必要があります

# Use nvm to switch versions (if installed):
# nvmを使用してバージョンを切り替え（インストールされている場合）：
nvm install 20
nvm use 20
```

#### 2. Missing Dependencies / 依存関係の欠落

**Problem**: Import errors or missing modules
**問題**：インポートエラーまたはモジュールの欠落

**Solution**:
```bash
# Clean install
# クリーンインストール
rm -rf node_modules package-lock.json
npm install

# For API:
# APIの場合：
cd lumi-core-api
rm -rf node_modules package-lock.json
npm install
```

#### 3. Port Already in Use / ポートが既に使用中

**Problem**: Error: Port 3000 is already in use
**問題**：エラー：ポート3000は既に使用されています

**Solution**:
```bash
# Find and kill the process using port 3000
# ポート3000を使用しているプロセスを見つけて終了
# On macOS/Linux:
lsof -ti:3000 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port:
# または別のポートを使用：
PORT=3001 npm run dev
```

#### 4. TypeScript Errors / TypeScriptエラー

**Problem**: TypeScript compilation errors
**問題**：TypeScriptコンパイルエラー

**Solution**:
```bash
# The project has "strict": false, so most errors should be warnings
# プロジェクトは "strict": false なので、ほとんどのエラーは警告になります

# Check tsconfig.json is properly configured
# tsconfig.jsonが適切に設定されているか確認

# Ensure TypeScript version matches:
# TypeScriptバージョンが一致していることを確認：
npm list typescript
```

#### 5. Cloudflare Workers Authentication / Cloudflare Workers認証

**Problem**: Unable to deploy API
**問題**：APIをデプロイできない

**Solution**:
```bash
# Login to Cloudflare
# Cloudflareにログイン
cd lumi-core-api
npx wrangler login

# Or set environment variables:
# または環境変数を設定：
export CLOUDFLARE_API_TOKEN=your_token
export CLOUDFLARE_ACCOUNT_ID=your_account_id

# Verify authentication:
# 認証を確認：
npx wrangler whoami
```

### Getting Help / ヘルプの取得

If you encounter issues not covered here:
ここに記載されていない問題が発生した場合：

1. Check existing GitHub Issues / 既存のGitHub Issueを確認
2. Review the README.md and official documentation / README.mdと公式ドキュメントを確認
3. Create a new issue with:
   以下を含む新しいissueを作成：
   - Description of the problem / 問題の説明
   - Steps to reproduce / 再現手順
   - Environment details (OS, Node version, etc.) / 環境の詳細（OS、Nodeバージョンなど）
   - Error messages / エラーメッセージ

---

## Additional Resources / 追加リソース

### Documentation Files / ドキュメントファイル

- `README.md` - Project overview / プロジェクト概要
- `RESPONSIBILITY.md` - System ownership map / システム所有権マップ
- `LUMI_CONSTITUTION_v1.0.md` - Constitutional rules / 憲法ルール
- `LUMI_CLASS_MODEL_v1.x.md` - Class model documentation / クラスモデルドキュメント
- `PRIVATE_BOOT_MODE_v1.0.md` - Private boot mode specification / プライベートブートモード仕様

### Key Principles / 重要な原則

1. **Single Source of Truth**: Only items in lumi-os are official
   **単一の情報源**：lumi-osにあるものだけが公式

2. **HQ-Only Modification**: Only A:HQ may modify OS rules
   **HQ専用の変更**：OS規則を変更できるのはA:HQのみ

3. **Boundary Respect**: Each class (A/B/C/D/E) operates in strict isolation
   **境界の尊重**：各クラス（A/B/C/D/E）は厳密に分離して動作

4. **No Dark Patterns**: LUMI follows anti-dark-pattern principles
   **ダークパターンなし**：LUMIは反ダークパターン原則に従う

---

## Package Managers / パッケージマネージャー

This project officially uses **npm**. However, you can use alternatives:
このプロジェクトは公式に **npm** を使用しています。ただし、代替を使用できます：

### Using pnpm

```bash
# Install pnpm
npm install -g pnpm

# Install dependencies
pnpm install

# Run scripts
pnpm run build
pnpm run start
```

### Using yarn

```bash
# Install yarn
npm install -g yarn

# Install dependencies
yarn install

# Run scripts
yarn build
yarn start
```

**Note**: The repository includes `package-lock.json`, which is specific to npm. If using pnpm or yarn, you may want to generate `pnpm-lock.yaml` or `yarn.lock` and add `package-lock.json` to `.gitignore` for your fork.

**注意**：リポジトリには npm 固有の `package-lock.json` が含まれています。pnpm または yarn を使用する場合は、`pnpm-lock.yaml` または `yarn.lock` を生成し、フォークの `.gitignore` に `package-lock.json` を追加することをお勧めします。

---

## License / ライセンス

MIT License - See `LICENSE` file for details.

MIT ライセンス - 詳細は `LICENSE` ファイルを参照してください。

---

**Last Updated / 最終更新**: 2026-01-10
**Version / バージョン**: 1.0.0
