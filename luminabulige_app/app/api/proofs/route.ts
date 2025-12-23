// functions/api/proofs.ts
export const onRequestGet: PagesFunction = async () => {
  return new Response(JSON.stringify({ ok: true, route: "/api/proofs" }), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
};
