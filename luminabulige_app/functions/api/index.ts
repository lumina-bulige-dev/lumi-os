cat > functions/api/index.ts <<'EOF'
export interface Env {
  // ここに後で KV / D1 / Secrets など足せる
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(req.url);

    // health
    if (url.pathname === "/" || url.pathname === "/health" || url.pathname === "/v1/health") {
      return new Response(JSON.stringify({ ok: true, path: url.pathname, ts: Date.now() }), {
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
};
EOF
