const cors = {
  "Access-Control-Allow-Origin": "*", // 本番は https://app.luminabulige.com に絞るの推奨
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "content-type": "application/json; charset=utf-8" },
  });
}

function text(s: string, status = 200) {
  return new Response(s, {
    status,
    headers: { ...cors, "content-type": "text/plain; charset=utf-8" },
  });
}

function b64u(bytes: ArrayBuffer) {
  const bin = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64uStr(s: string) {
  return b64u(new TextEncoder().encode(s));
}

async function hmacSign(keyStr: string, msg: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(keyStr),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  return b64u(sig);
}

function timingSafeEq(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function getBearer(req: Request) {
  const h = req.headers.get("authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1] ?? null;
}

export default {
  async fetch(request: Request, env: any) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    // health
    if (request.method === "GET" && path === "/health") {
      return json({ status: "ok", service: "lumi-core-api", ts: new Date().toISOString() });
    }

    // 招待発行（管理者のみ）
    if (request.method === "POST" && path === "/invite/issue") {
      const bearer = getBearer(request);
      if (!bearer || bearer !== env.ADMIN_KEY) return json({ ok: false, error: "unauthorized" }, 401);

      const body = await request.json().catch(() => ({}));
      const ttlDays = Math.max(1, Math.min(30, Number(body.ttlDays ?? 7))); // 1〜30日に丸め
      const now = Math.floor(Date.now() / 1000);
      const exp = now + ttlDays * 86400;

      // payload（招待トークンの中身）
      const payload = {
        v: 1,
        jti: crypto.randomUUID(),
        iat: now,
        exp,
      };

      const payloadB64 = b64uStr(JSON.stringify(payload));
      const sig = await hmacSign(env.INVITE_HMAC_KEY, payloadB64);
      const invite = `${payloadB64}.${sig}`;

      return json({ ok: true, invite, exp, ttlDays });
    }

    // 招待検証（クライアント側から叩いてOK）
    if (request.method === "POST" && path === "/invite/verify") {
      const body = await request.json().catch(() => ({}));
      const invite = String(body.invite ?? "");
      const [payloadB64, sig] = invite.split(".");
      if (!payloadB64 || !sig) return json({ ok: false, error: "bad_format" }, 400);

      const expected = await hmacSign(env.INVITE_HMAC_KEY, payloadB64);
      if (!timingSafeEq(sig, expected)) return json({ ok: false, error: "bad_sig" }, 401);

      const payloadJson = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")));
      const now = Math.floor(Date.now() / 1000);
      if (Number(payloadJson.exp ?? 0) < now) return json({ ok: false, error: "expired" }, 410);

      return json({ ok: true, payload: payloadJson });
    }

    return text("not found", 404);
  },
};
