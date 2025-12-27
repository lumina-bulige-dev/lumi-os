export const onRequest: PagesFunction = async ({ request }) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };

  // Preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  // Health check (ブラウザ直叩きでも落ちない)
  if (request.method === "GET") {
    return Response.json(
      { ok: true, service: "cia", ts: Date.now() },
      { headers: cors }
    );
  }

  if (request.method !== "POST") {
    return Response.json(
      { ok: false, error: "method_not_allowed" },
      { status: 405, headers: cors }
    );
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return Response.json(
        { ok: false, error: "invalid_json" },
        { status: 400, headers: cors }
      );
    }

    // TODO: ここに本処理（verify/proxy/署名など）
    return Response.json(
      { ok: true, received: body },
      { headers: cors }
    );
  } catch (err: any) {
    console.error("CIA API ERROR:", err);
    return Response.json(
      { ok: false, error: String(err?.message ?? err) },
      { status: 500, headers: cors }
    );
  }
};
