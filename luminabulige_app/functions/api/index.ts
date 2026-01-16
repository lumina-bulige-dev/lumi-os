cat > functions/api/index.ts <<'EOF'
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
