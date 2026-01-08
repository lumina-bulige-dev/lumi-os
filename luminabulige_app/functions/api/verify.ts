// functions/api/verify.ts  （Pages Functions）
// luminabulige_app/functions/api/verify.ts
// Pages Functions 経由で core-api に中継するだけの薄いプロキシ
// luminabulige_app/functions/api/verify.ts
// @ts-nocheck

// Cloudflare Pages Functions 用：/api/verify を core-api にプロキシするだけ
// luminabulige_app/functions/api/verify.ts
// @ts-nocheck

// luminabulige_app/functions/api/verify.ts
// Cloudflare Pages Functions 用のプレースホルダ。
// 今は Next.js 側から直接 core-api の /verify を叩く想定なので、
// この Functions は「将来用のメモ」としてだけ残しておく。

/*
export const onRequest = async (ctx: any) => {
  const url = new URL(ctx.request.url);
  url.hostname = "api.luminabulige.com";
  url.pathname = "/verify"; // 既存エンドポイントに合わせる

  return fetch(new Request(url.toString(), ctx.request));
};
*/

// TS に「このファイルはちゃんとモジュールだよ」と知らせるためのダミー export
export {};
