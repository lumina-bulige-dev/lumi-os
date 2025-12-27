// luminabulige_app/functions/api/cia.ts
export const onRequest: PagesFunction = async ({ request }) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  if (request.method === "GET") {
    return new Response(JSON.stringify({ status: "ok", service: "cia" }), {
      headers: { "content-type": "application/json; charset=utf-8", ...cors },
    });
  }

  // POST例
  const body = await request.json().catch(() => ({}));
  return new Response(JSON.stringify({ ok: true, received: body }), {
    headers: { "content-type": "application/json; charset=utf-8", ...cors },
  });
};
