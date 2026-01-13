cat > functions/api/index.ts <<'EOF'
const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "Content-Type, Authorization",
};

if (req.method === "OPTIONS") return new Response(null, { headers: cors });

return new Response(JSON.stringify(...), { headers: { ...cors, "content-type": "application/json; charset=utf-8" }});

export default {
  async fetch(req: Request) {
    const url = new URL(req.url);

    const ok = (path: string) =>
      new Response(JSON.stringify({ ok: true, path, ts: Date.now() }), {
        headers: { "content-type": "application/json; charset=utf-8" },
      });

    if (url.pathname === "/" || url.pathname === "/health" || url.pathname === "/v1/health") {
      return ok(url.pathname);
    }

    if (url.pathname === "/favicon.ico") return new Response("", { status: 204 });

    return new Response("Not Found", { status: 404 });
  },
};
EOF

