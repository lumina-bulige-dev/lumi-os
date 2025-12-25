// functions/api/verify.ts  （Pages Functions）
export const onRequest: PagesFunction = async (ctx) => {
  const url = new URL(ctx.request.url);
  // 例: 既存の core-api Worker に中継するだけ
  url.hostname = "api.luminabulige.com";
  url.pathname = "/verify"; // 既存エンドポイントに合わせる
  return fetch(new Request(url.toString(), ctx.request));
};
