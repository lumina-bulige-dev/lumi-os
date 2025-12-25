// functions/api/verify.ts  （Pages Functions）
// luminabulige_app/functions/api/verify.ts
// Pages Functions 経由で core-api に中継するだけの薄いプロキシ

export const onRequest = async (ctx: any) => {
  const url = new URL(ctx.request.url);

  // 例: 既存の core-api Worker に中継するだけ
  url.hostname = "api.luminabulige.com";

  // 必要最小限だけコピー（雑に全部流してもいい）
  return fetch(url.toString(), {
    method: ctx.request.method,
    headers: ctx.request.headers,
    body: ctx.request.body,
  });
};

/*export const onRequest: PagesFunction = async (ctx) => {
  const url = new URL(ctx.request.url);
  // 例: 既存の core-api Worker に中継するだけ
  url.hostname = "api.luminabulige.com";
  url.pathname = "/verify"; // 既存エンドポイントに合わせる
  return fetch(new Request(url.toString(), ctx.request));*/
};
