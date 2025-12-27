type Env = {
  ADMIN_KEY: string;             // 発行権限（管理者トークン）
  INVITE_SIGNING_KEY: string;    // 招待トークン署名用（HMAC）
};

const ALLOWED_ORIGINS = new Set([
  "https://app.luminabulige.com",
  "http://localhost:3000",
]);

function b64u(bytes: Uint8Array) {
  let s = "";
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function b64uToBytes(s: string) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4 ? "=".repeat(4 - (s.length % 4)) : "";
  const bin = atob(s + pad);
  return new Uint8Array([...bin].map((c) => c.charCodeAt(0)));
}
async function hmacSha256(secret: string, data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return new Uint8Array(sig);
}
function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });
}
function text(body: string, status = 200, headers: Record<string, string> = {}) {
  return new Response(body, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8", ...headers },
  });
}
function corsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : "https://app.luminabulige.com";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}
function unauthorized(req: Request) {
  return json({ ok: false, error: "unauthorized" }, 401, corsHeaders(req));
}
function bad(req: Request, msg: string, code = 400) {
  return json({ ok: false, error: msg }, code, corsHeaders(req));
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;

    // CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(req) });
    }

    // health
    if (req.method === "GET" && (path === "/health" || path === "/")) {
      return json(
        { status: "ok", service: "lumi-core-api", timestamp: new Date().toISOString() },
        200,
        corsHeaders(req)
      );
    }

    // invite/issue (管理者のみ)
    if (path === "/invite/issue" && req.method === "POST") {
      const auth = req.headers.get("Authorization") || "";
      if (auth !== `Bearer ${env.ADMIN_KEY}`) return unauthorized(req);

      let body: any = {};
      try {
        body = await req.json();
      } catch {}

      const ttlDays = Number(body?.ttlDays ?? 7);
      if (!Number.isFinite(ttlDays) || ttlDays <= 0 || ttlDays > 90) {
        return bad(req, "ttlDays must be 1..90");
      }

      const now = Math.floor(Date.now() / 1000);
      const exp = now + ttlDays * 86400;

      // 乱数
      const rndBytes = new Uint8Array(16);
      crypto.getRandomValues(rndBytes);
      const rnd = b64u(rndBytes);

      const payload = { v: 1, iat: now, exp, rnd };
      const payloadB64 = b64u(new TextEncoder().encode(JSON.stringify(payload)));

      // ★ ここが INVITE_SIGNING_KEY
      const sig = await hmacSha256(env.INVITE_SIGNING_KEY, payloadB64);
      const token = `${payloadB64}.${b64u(sig)}`;

      return json({ ok: true, invite: token, exp, ttlDays }, 200, corsHeaders(req));
    }

    // invite/verify（ブラウザテストしやすいように GET も用意）
    if (path === "/invite/verify" && (req.method === "POST" || req.method === "GET")) {
      let invite = url.searchParams.get("invite") || "";

      if (req.method === "POST") {
        try {
          const body: any = await req.json();
          invite = String(body?.invite ?? invite);
        } catch {}
      }

      if (!invite.includes(".")) return bad(req, "invalid invite");

      const [payloadB64, sigB64] = invite.split(".", 2);

      // ★ ここが INVITE_SIGNING_KEY
      const expected = await hmacSha256(env.INVITE_SIGNING_KEY, payloadB64);

      // timing-safe っぽく
      const got = b64uToBytes(sigB64);
      if (got.length !== expected.length) return bad(req, "bad signature", 403);

      let diff = 0;
      for (let i = 0; i < got.length; i++) diff |= got[i] ^ expected[i];
      if (diff !== 0) return bad(req, "bad signature", 403);

      let payload: any;
      try {
        payload = JSON.parse(new TextDecoder().decode(b64uToBytes(payloadB64)));
      } catch {
        return bad(req, "bad payload", 400);
      }

      const now = Math.floor(Date.now() / 1000);
      if (!payload?.exp || now > payload.exp) return bad(req, "expired", 403);

      return json({ ok: true, payload }, 200, corsHeaders(req));
    }

    return text("not found", 404, corsHeaders(req));
  },
};
