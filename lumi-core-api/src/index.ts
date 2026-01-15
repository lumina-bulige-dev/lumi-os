export interface Env { /* ... */ }
const te = new TextEncoder();
const td = new TextDecoder();

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(s: string): Uint8Array {
  let b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function hmacSha256(key: string, msg: string): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    te.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, te.encode(msg));
  return new Uint8Array(sig);
}
async function signInviteToken(payload: any, env: Env): Promise<string> {
  if (!env.INVITE_SIGNING_KEY) throw new Error("missing INVITE_SIGNING_KEY");
  const raw = JSON.stringify(payload);
  const payloadB64u = toBase64Url(te.encode(raw));
  const sigBytes = await hmacSha256(env.INVITE_SIGNING_KEY, payloadB64u);
  const sigB64u = toBase64Url(sigBytes);
  return `${payloadB64u}.${sigB64u}`;
}
async function verifyInviteToken(token: string, env: Env) {
  if (!env.INVITE_SIGNING_KEY) return { ok: false, reason: "missing INVITE_SIGNING_KEY" };
  if (!token || token.length < 10) return { ok: false, reason: "token too short" };

  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "bad token format" };

  const [payloadB64u, sigB64u] = parts;

  let payloadBytes: Uint8Array;
  let sigBytes: Uint8Array;
  try {
    payloadBytes = fromBase64Url(payloadB64u);
    sigBytes = fromBase64Url(sigB64u);
  } catch {
    return { ok: false, reason: "bad base64url" };
  }

  // 署名検証（自前で constant-time compare）
  const expected = await hmacSha256(env.INVITE_SIGNING_KEY, payloadB64u);
  if (!timingSafeEqual(expected, sigBytes)) {
    return { ok: false, reason: "bad signature" };
  }

  // payload parse
  let payload: any;
  try {
    payload = JSON.parse(td.decode(payloadBytes));
  } catch {
    return { ok: false, reason: "bad payload json" };
  }

  // 必須フィールド（最低限）
  if (payload?.v !== 1) return { ok: false, reason: "unsupported version" };
  if (typeof payload?.exp !== "number") return { ok: false, reason: "missing exp" };
  if (typeof payload?.iat !== "number") return { ok: false, reason: "missing iat" };

  const now = Date.now();
  if (payload.exp <= now) return { ok: false, reason: "expired" };

  // 未来すぎるiat（時計ズレ2分許容）
  if (payload.iat > now + 2 * 60 * 1000) return { ok: false, reason: "iat in future" };

  return { ok: true, payload };
}
async function handleInviteIssue(req: Request, env: Env) {
  const url = new URL(req.url);
  if (req.method !== "POST") return text("method not allowed", 405);
  if (!hasAdmin(env, req, url)) return text("unauthorized", 401);

  const body = await readBody(req);
  const now = Date.now();
  const payload = {
    v: 1,
    iat: now,
    sub: (body && (body.email || body.sub || body.user)) ?? "unknown",
    exp: now + 1000 * 60 * 60 * 24 * 7,
  };

  const token = await signInviteToken(payload, env);

  return json({
    ok: true,
    token,
    verify_url: `${url.origin}/invite/verify?token=${encodeURIComponent(token)}`,
    payload,
  });
}
async function handleInviteVerify(req: Request, env: Env) {
  const url = new URL(req.url);

  if (req.method === "HEAD" || req.method === "GET") {
    const token = url.searchParams.get("token");
    if (!token) return json({ ok: false, error: "token required (POST recommended)" }, 400);

    const v = await verifyInviteToken(token, env);
    if (!v.ok) return json({ ok: false, error: v.reason }, 401);
    return json({ ok: true, result: "OK", payload: v.payload }, 200);
  }

  if (req.method !== "POST") return text("method not allowed", 405);

  const body = await readBody(req);
  const token = (body && (body.token || body.invite || body.t)) || url.searchParams.get("token");
  if (!token || typeof token !== "string") return json({ ok: false, error: "token required" }, 400);

  const v = await verifyInviteToken(token, env);
  if (!v.ok) return json({ ok: false, error: v.reason }, 401);
  return json({ ok: true, result: "OK", payload: v.payload }, 200);
}
function corsPreflight(req: Request) {
  const reqHeaders = req.headers.get("Access-Control-Request-Headers") || "";
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,HEAD,OPTIONS",
      "Access-Control-Allow-Headers": reqHeaders || "content-type,authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
if (req.method === "OPTIONS") return corsPreflight(req);
function hasAdmin(env: Env, req: Request) {
  const auth = req.headers.get("Authorization") || "";
  return Boolean(
    env.ADMIN_KEY &&
    auth.startsWith("Bearer ") &&
    auth.slice("Bearer ".length) === env.ADMIN_KEY
  );
}

// --- router helpers ---
function normPath(...) { ... }

// --- http helpers ---
function corsPreflight(req: Request) { ... }
function json(...) { ... }
function text(...) { ... }
async function readBody(...) { ... }

// --- auth ---
function hasAdmin(...) { ... }

// --- crypto helpers (base64url/hmac) ---
function toBase64Url(...) { ... }
function fromBase64Url(...) { ... }
function timingSafeEqual(...) { ... }
async function hmacSha256(...) { ... }

// --- invite ---
async function signInviteToken(...) { ... }
async function verifyInviteToken(...) { ... }

// --- handlers ---
async function handleDebug(...) { ... }
async function handleInviteIssue(...) { ... }
async function handleInviteVerify(...) { ... }

// --- entry ---
export default {
  async fetch(req: Request, env: Env) {
    if (req.method === "OPTIONS") return corsPreflight(req);

    const url = new URL(req.url);
    const p = normPath(url.pathname);

    // routes...
  },
};
