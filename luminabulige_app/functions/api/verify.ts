// functions/api/verify.ts  （Pages Functions）
// luminabulige_app/functions/api/verify.ts
// Pages Functions 経由で core-api に中継するだけの薄いプロキシ
// luminabulige_app/functions/api/verify.ts
// @ts-nocheck

// Cloudflare Pages Functions 用：/api/verify を core-api にプロキシするだけ
export const onRequest = async (context) => {
  const url = new URL(context.request.url);

  // core-api 側のホストに付け替え
  url.hostname = "api.luminabulige.com";

  // シンプルに fetch で中継
  return fetch(url.toString(), {
    method: context.request.method,
    headers: context.request.headers,
    body: context.request.body,
  });
};
/*export const onRequest: PagesFunction = async (ctx) => {
  const url = new URL(ctx.request.url);
  // 例: 既存の core-api Worker に中継するだけ
  url.hostname = "api.luminabulige.com";
  url.pathname = "/verify"; // 既存エンドポイントに合わせる
  return fetch(new Request(url.toString(), ctx.request));*/
};
