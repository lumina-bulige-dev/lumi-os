# LUMI OS - ローカル開発環境セットアップガイド

このガイドは、LUMI OSの開発環境をローカルマシンにセットアップするための手順を提供します。

## 目次

1. [前提条件](#前提条件)
2. [インストール](#インストール)
3. [開発サーバーの起動](#開発サーバーの起動)
4. [プロジェクトのビルド](#プロジェクトのビルド)
5. [lumi-core-api (Cloudflare Workers) での作業](#lumi-core-api-cloudflare-workers-での作業)
6. [テスト](#テスト)
7. [プロジェクト構造](#プロジェクト構造)
8. [トラブルシューティング](#トラブルシューティング)

## 前提条件

開始する前に、システムに以下がインストールされていることを確認してください：

### 必須ソフトウェア

- **Node.js**: バージョン 20.x 以降（LTS推奨）
  - ダウンロード: https://nodejs.org/
  - バージョン確認: `node --version`
  
- **npm**: バージョン 9.x 以降（Node.jsに付属）
  - バージョン確認: `npm --version`
  - **代替**: お好みに応じて `pnpm` または `yarn` も使用可能

- **Git**: バージョン管理用
  - ダウンロード: https://git-scm.com/
  - バージョン確認: `git --version`

### サポートOS

- **Linux**: Ubuntu 20.04+, Debian 11+, または他のモダンなディストリビューション
- **macOS**: macOS 11 (Big Sur) 以降
- **Windows**: Windows 10/11（WSL2推奨）またはネイティブWindows

### オプションツール

- **Docker**: コンテナ化開発用（オプション）
- **Cloudflare Wrangler CLI**: Cloudflare Workersのデプロイとローカルテスト用
- **VSCode** またはお好みのコードエディター

## インストール

### 1. リポジトリのクローン

```bash
git clone https://github.com/lumina-bulige-dev/lumi-os.git
cd lumi-os
```

### 2. 依存関係のインストール

#### メインプロジェクト（Next.jsアプリケーション）

```bash
# npm を使用（デフォルト）
npm install

# または pnpm を使用
pnpm install

# または yarn を使用
yarn install
```

#### lumi-core-api（Cloudflare Workers）

```bash
cd lumi-core-api
npm install
cd ..
```

### 3. インストールの確認

インストール後、依存関係が正しくインストールされたことを確認します：

```bash
# node_modules が存在することを確認
ls -la node_modules

# Next.js がインストールされていることを確認
npx next --version
```

## 開発サーバーの起動

### Next.js開発サーバーの起動

```bash
npm run build
npm run start
```

アプリケーションは以下で利用可能になります：
- **ローカル**: http://localhost:3000

注意: このプロジェクトは `next.config.js` で `output: "export"` が設定されているため、`next build` と `next start` を使用します。ホットリロード開発のため、`package.json` に `dev` スクリプトを追加できます：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

その後、以下を実行：
```bash
npm run dev
```

### 変更時の自動リロード

`npm run dev` を使用すると、以下の変更時に開発サーバーが自動的にリロードされます：
- `/app` 内のReactコンポーネント
- TypeScript/JavaScriptファイル
- CSSファイル
- 設定ファイル

## プロジェクトのビルド

### 本番ビルド

最適化された本番ビルドを作成：

```bash
npm run build
```

これにより：
1. TypeScriptファイルをコンパイル
2. JavaScriptをバンドル・最適化
3. `/out` ディレクトリに静的ファイルを生成（静的エクスポート用）
4. 画像とアセットを最適化

### 本番ビルドのローカルテスト

ビルド後、本番ビルドをテスト：

```bash
npm run start
```

## lumi-core-api (Cloudflare Workers) での作業

`lumi-core-api` ディレクトリには、APIレイヤー用のCloudflare Workersコードが含まれています。

### Wranglerを使用したローカル開発

```bash
cd lumi-core-api

# wranglerがインストールされていない場合はインストール
npm install

# ローカル開発サーバーを起動
npx wrangler dev
```

これにより、ローカルのCloudflare Workers環境が起動します。

### Cloudflareへのデプロイ（本番）

```bash
cd lumi-core-api

# 本番環境へデプロイ
npm run deploy
```

**注意**: Cloudflareの認証情報を設定する必要があります：
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### Wranglerの設定

設定オプションについては `lumi-core-api/wrangler.toml` を確認してください。

## テスト

現在、このプロジェクトには自動テストが設定されていません。テストを追加したい場合：

### 推奨テストツール

- **Jest**: ユニットテスト用
- **React Testing Library**: コンポーネントテスト用
- **Playwright** または **Cypress**: E2Eテスト用

### リンターの実行

コード品質を維持するため、リンティングツールを追加できます：

```bash
# ESLintをインストール（オプション）
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# リンターを実行
npx eslint . --ext .ts,.tsx,.js,.jsx
```

## プロジェクト構造

```
lumi-os/
├── app/                    # Next.js appディレクトリ
│   ├── components/         # Reactコンポーネント
│   ├── api/               # APIルート
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # ホームページ
├── lumi-core-api/         # Cloudflare Workers API
│   ├── src/               # Workerソースコード
│   ├── package.json       # API依存関係
│   └── wrangler.toml      # Cloudflare設定
├── lumi-core-web/         # モックデータとWebコア
│   └── mock/              # モックJSONペイロード
├── protocols/             # プロトコル定義
├── rules/                 # システムルール
├── specifications/        # 仕様書
├── package.json           # メイン依存関係
├── tsconfig.json          # TypeScript設定
├── next.config.js         # Next.js設定
└── README.md              # プロジェクト概要
```

## トラブルシューティング

### よくある問題

#### 1. Nodeバージョンの不一致

**問題**: Node.jsバージョン互換性に関するエラー。

**解決策**: Node.js 20.x以降を使用してください。`nvm`（Node Version Manager）を使用してバージョンを切り替えます：

```bash
# nvmをインストール（インストールされていない場合）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Node 20をインストールして使用
nvm install 20
nvm use 20
```

#### 2. npm install が失敗する

**問題**: 権限エラーまたはネットワーク問題でインストールが失敗。

**解決策**:

```bash
# npmキャッシュをクリア
npm cache clean --force

# 再試行
npm install

# または --legacy-peer-deps フラグを使用
npm install --legacy-peer-deps
```

#### 3. ポート3000が既に使用中

**問題**: 別のアプリケーションがポート3000を使用している。

**解決策**: 他のアプリケーションを停止するか、別のポートを使用：

```bash
PORT=3001 npm run dev
```

#### 4. TypeScriptエラー

**問題**: TypeScriptコンパイルエラー。

**解決策**: 正しいTypeScriptバージョンがあることを確認：

```bash
npm install --save-dev typescript@^5.7.0
```

#### 5. Cloudflare Wranglerの問題

**問題**: Wranglerコマンドが失敗する。

**解決策**:

```bash
# Cloudflareで認証
npx wrangler login

# 設定を確認
npx wrangler whoami
```

#### 6. パスエイリアスに関するビルドエラー

**問題**: 「Cannot find module '@/app/components/...'」でビルドが失敗する。

**解決策**: これはリポジトリの既知の問題です。`@` パスエイリアスが `tsconfig.json` で設定されていない可能性があります。以下のいずれかを実行できます：

1. `tsconfig.json` にパスエイリアスを追加：
```json
{
  "compilerOptions": {
    ...
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

2. または影響を受けるファイルで `@/` エイリアスの代わりに相対インポートを使用。

**注意**: コードベースの一部には既存のビルド問題がある可能性があります。作業している領域に焦点を当ててください。

### ヘルプを得る

ここでカバーされていない問題が発生した場合：

1. [GitHub Issues](https://github.com/lumina-bulige-dev/lumi-os/issues) を確認
2. メインの [README.md](README.md) でプロジェクトのコンテキストを確認
3. 公式Next.jsドキュメントを確認: https://nextjs.org/docs
4. Cloudflare Workersドキュメントを確認: https://developers.cloudflare.com/workers/

## 環境変数

プロジェクトが環境変数を必要とする場合、`.env.local` ファイルを作成します：

```bash
# .env.local の例
NEXT_PUBLIC_API_URL=http://localhost:8787
```

**注意**: `.env.local` やシークレットを含むファイルをバージョン管理にコミットしないでください。

## CI/CD

プロジェクトにはGitHub Actionsワークフローが含まれています：

- **deploy-workers.yml**: `main` ブランチへのプッシュ時に `lumi-core-api` をCloudflare Workersに自動デプロイ

ローカルでCIチェックを実行するには：

```bash
# プロジェクトをビルド
npm run build

# TypeScript型チェック
npx tsc --noEmit
```

## 次のステップ

開発環境のセットアップ後：

1. [README.md](README.md) を読んでLUMI OSアーキテクチャを理解
2. `/specifications` 内の正式仕様書を確認
3. `/rules` 内のシステムルールを確認
4. `/lumi-core-web/mock` 内のモックデータを探索

## コントリビューション

これは正式なLUMI OSリポジトリです。A:HQ（本部レイヤー）のみがOSルールと仕様を変更する書き込みアクセス権を持ちます。コントリビューションワークフローについては、メインのREADME.mdを参照してください。

---

## よくある質問（FAQ）

### Q1: どのパッケージマネージャを使うべきですか？

**A**: npm（デフォルト）、pnpm、yarnのいずれも使用可能です：
- **npm**: Node.jsに付属、最も一般的
- **pnpm**: ディスク容量効率が良い、高速
- **yarn**: 高速、予測可能な依存関係管理

### Q2: Dockerを使用できますか？

**A**: はい、Dockerfileを作成できます。例：

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Q3: データベースは必要ですか？

**A**: 現在の設定では、LUMIは主に静的ファイルとCloudflare Workersを使用しています。データベースは必須ではありませんが、必要に応じて追加できます。

### Q4: 外部サービスとの統合は？

**A**: Cloudflare Workersを通じて外部サービスと統合できます。詳細は `lumi-core-api/src` を参照してください。

---

**最終更新**: 2026-01-10
