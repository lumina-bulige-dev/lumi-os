# ソースコードからのセットアップガイド（VCP Explorer / LUMINA BULIGE 向け）

自社サーバー上に検証ダッシュボードを構築するための手順です。オープンソースの **VCP Explorer** クイックスタートをベースに、`app.luminabulige.com` / `api.luminabulige.com` で動かすための最小構成をまとめています。

## 前提条件
- Node.js 18 以上
- npm 9 以上
- Git
- Unix 系シェル（Linux / macOS / WSL）

## 1. ソース取得
```bash
git clone https://github.com/veritaschain/vcp-explorer.git   # 公式 VCP Explorer
cd vcp-explorer
# 必要に応じて安定版タグへ切り替え
# git checkout <tag>
```

## 2. 環境変数を用意
クイックスタートの雛形（例：`.env.example`）を `.env.local` にコピーし、LUMINA BULIGE のエンドポイントを設定します。Vite ベースなら `VITE_`、Next.js ベースなら `NEXT_PUBLIC_` を使います。

```bash
cp .env.example .env.local
```

例）
```
# フロントエンドが叩く API
VITE_API_BASE_URL=https://api.luminabulige.com
# アプリの公開 URL（CORS / リンク生成用）
VITE_APP_ORIGIN=https://app.luminabulige.com
# サーバー側で CORS を許可する場合
API_CORS_ALLOWED_ORIGIN=https://app.luminabulige.com
```

> 環境変数名は利用するブランチのクイックスタートに合わせて置き換えてください（`VITE_` → `NEXT_PUBLIC_` など）。

## 3. 依存関係をインストール
```bash
npm install
```

## 4. ローカル開発サーバー
```bash
npm run dev
```
CLI が表示する URL（一般的には `http://localhost:5173` または `http://localhost:3000`）にアクセスし、API ベース URL が `api.luminabulige.com` になっていることを確認します。

## 5. 本番ビルドと起動
```bash
npm run build
# Next.js の場合
npm run start
# Vite の場合（プレビュー）
# npm run preview
```

## 6. リバースプロキシ例（nginx）
アプリを `localhost:3000`（または dev サーバーのポート）で待ち受け、`app.luminabulige.com` からリバースプロキシします。

```nginx
server {
    server_name app.luminabulige.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # TLS は certbot / acme.sh 等で付与
    listen 443 ssl;
}
```

## 7. 動作確認チェックリスト
- `curl https://api.luminabulige.com/health` が 200 を返す
- ブラウザで `app.luminabulige.com` を開き、イベントログ一覧が表示される
- 詳細画面で検証 API 呼び出しが成功する（CORS エラーが出ない）

## 8. トラブルシュート
- Node / npm のバージョンが要件未満 → `nvm use 18` で切り替え
- CORS エラー → `.env.local` と API 側の許可オリジン設定を `https://app.luminabulige.com` に揃える
- ビルド時に API を直叩きする設定の場合、`api.luminabulige.com` を内部 DNS から解決できるか確認する
