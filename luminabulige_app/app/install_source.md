ソースコードからのセットアップガイド

自社で開発する検証ダッシュボードを自前のサーバーでビルド・運用するための手順をまとめました。以下では、オープンソースの VCP Explorer のクイックスタートをベースにしつつ、LUMINA BULIGE 向けに必要なカスタマイズを説明します。

概要

VCP Explorer は暗号学的証明付きイベントログを閲覧・検証するためのフロントエンドです。本ドキュメントでは、このフロントエンドをソースコードから構築し、御社のサブドメイン（例: app.luminabulige.com）および API (api.luminabulige.com) に接続する手順を示します。手順は主に Node.js / npm ベースで行い、Quick Start セクションに基づいています。

前提条件

以下の環境がインストールされていることを確認してください。

Node.js 18 以上

npm 9 以上

Git （リポジトリをクローンするため）

Unix 系シェル（Linux/MacOS）または WSL (Windows 環境の方)

ソースの取得

VCP Explorer のソースは GitHub で公開されています。以下のコマンドでクローンして移動します。

git clone https://github.com/veritaschain/vcp-explorer.git
cd vcp-explorer


クローン後、御社独自の UI 変更やブランディングを行う場合は、このリポジトリをフォークし、origin を自社リポジトリに設定してから作業すると良いでしょう。

依存関係のインストール

プロジェクト内で必要な npm パッケージをインストールします。

npm install


インストール後、依存関係の脆弱性チェックやフォーマットチェックを実行する場合は、以下のスクリプトを併用します。

npm run lint    # コード整形チェック
npm run test    # 単体テスト（用意されている場合）

開発サーバーの起動

ローカル環境で UI を確認するには、以下のコマンドで開発サーバーを起動します。

npm run dev


初期設定ではポート 5173 でサーバーが起動するため、ブラウザで http://localhost:5173 にアクセスすると開発版のダッシュボードが表示されます。

API エンドポイントの設定

VCP Explorer はバックエンド API に接続してイベントや証明書を取得します。開発環境では src/lib/api-client.ts または .env.local で API ベース URL を指定します。

VITE_API_BASE_URL=https://api.luminabulige.com/v1


公式の README では VITE_API_BASE_URL=https://explorer.veritaschain.org/api/v1 となっていますが、自社環境では api.luminabulige.com に置き換えます。

利用可能な API エンドポイント

VCP Explorer が利用する主な REST エンドポイントは以下の通りです。

GET /events : イベント一覧取得

GET /events/{id} : 特定イベントの詳細取得

GET /events/{id}/proof : Merkle 包含証明の取得

GET /chain/{trace_id} : 同一トレース ID のイベント連鎖

POST /verify : 証明データの検証

GET /certificates/{id} : 証明書 PDF のダウンロード

API 側は別プロジェクト（Cloudflare Workers 等）でデプロイし、CORS 設定で app.luminabulige.com と verify.luminabulige.com の両方を許可します。詳細な API 実装は vcp-explorer-api リポジトリや OpenAPI スキーマを参照してください。

本番ビルドとデプロイ

本番環境にデプロイする際はビルド済みアセットを生成します。

npm run build


dist/ ディレクトリに静的ファイルが生成されます。これらを Cloudflare Pages や Netlify、Vercel などの静的ホスティングサービスにアップロードすることでフロントエンドを公開できます。

デプロイ環境がサブディレクトリである場合（例: /explorer/app/ にデプロイする場合）は、vite.config.ts の base 設定を変更します。

export default defineConfig({
  base: '/explorer/app/',
  // その他設定
});

カスタマイズと運用に関する注意

認証の取り扱い：ユーザーログインを追加する場合は、Cookie ドメインを app.luminabulige.com に限定し、verify サブドメインでは基本的に認証不要で閲覧できるようにします。

セキュリティ設定：API にはレートリミットと認証キーを導入し、外部からの乱用を防止します。Cloudflare Workers の環境変数で API キーや秘密鍵を安全に管理します。

多言語対応：src/i18n/locales/ フォルダに翻訳ファイルを追加することで多言語表示が可能です。既定では英語・日本語・中国語・スペイン語・ドイツ語・フランス語・チェコ語が含まれています。

アクセシビリティと UI：TailwindCSS と Lucide Icons を採用しており、色分けやアニメーションでイベントの状態を明示できます。御社ブランドに合わせたカラーパレットに変更する際は tailwind.config.js を編集してください。

証明書生成：/events/{id}/proof エンドポイントから取得したデータを用いて、イベントごとに PDF 証明書を生成・配布することができます。署名や Merkle 包含証明は暗号学的ライブラリ（Web Crypto API）で検証可能です。

まとめ

本資料では、ソースコードから検証可能なダッシュボードを構築する手順を概説しました。Node.js 環境でリポジトリをクローンし、依存関係をインストールして開発サーバーを起動するだけで、独自の検証 UI を立ち上げられます。API ベース URL やビルド設定を自社ドメインに合わせて調整し、法務・規制要件を満たす透明性の高いサービスを提供してください。
