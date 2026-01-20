---
name: "A1: Cloudflare Pages ビルド/デプロイ安定通過"
about: "luminabulige_app の Pages ビルド/デプロイを安定通過させる"
title: "A1: Cloudflare Pages ビルド/デプロイ安定通過（luminabulige_app）"
labels: ["area:public", "type:build"]
assignees: []
---

# A1: Cloudflare Pages ビルド/デプロイ安定通過（luminabulige_app）

## 担当
- @TBD

## 期日
- YYYY-MM-DD

## やること
- package.json scripts を統一

```json
{
  "dev":"next dev",
  "build":"next build",
  "pages:build":"next build && npx @cloudflare/next-on-pages",
  "pages:dev":"npx @cloudflare/next-on-pages --watch & npx wrangler pages dev .vercel/output/static --compatibility-flag=nodejs_compat",
  "start":"next start"
}
```

- 依存整合：next@15.5.2 / @cloudflare/next-on-pages@^1 / wrangler@^3
- .npmrc 追加：legacy-peer-deps=true（他は任意）
- ルートに .node-version (22)
- next.config.mjs 安全化

```js
const nextConfig = {
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false }
};

export default nextConfig;
```

- 生成物/バックアップ（*.bak 等）削除、.gitignore 強化
- Public層では Node組込み（fs/net/tls等）を import しない

## DoD
- Cloudflare Pages のプレビューが 200
- / /v /proof 表示OK（書込み/承認UIなし）
