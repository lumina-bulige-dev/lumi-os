export default {
  async fetch(req: Request): Promise<Response> {
    const cors = {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type, authorization",
    };

    if (req.method === "OPTIONS") return new Response(null, { headers: cors });

    // ここに本処理（例）
    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...cors, "content-type": "application/json; charset=utf-8" } }
    );
  },
};
