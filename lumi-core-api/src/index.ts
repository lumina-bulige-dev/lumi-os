// src/index.ts
import { MOCK_HOME_STATE } from "./mocks/home_state";

export interface Env {
  // Proofs (KV)
  PROOFS: KVNamespace;
  PROOF_HMAC_SECRET: string;
  PROOF_KID?: string;

  // Wise (Webhook)
  WISE_WEBHOOK_PUBLIC_KEY_PEM?: string; // -----BEGIN PUBLIC KEY----- ... -----END PUBLIC KEY-----
  DB?: D1Database; // optional: wise_webhook_events 保存したい場合

  // Links
  WISE_REFERRAL_URL?: string;
  WISE_AFFILIATE_URL?: string;
}

type Result = "OK" | "NG" | "REVOKED" | "UNKNOWN";

type ProofRow = {
  proofId: string;
  alg: "HS256";
  kid: string;
  ts: number;
  hashB64u: string;
  sigB64u: string;
  payloadB64u: string;
  version: "v1";
};

const ALLOW_ORIGINS = new Set([
  "https://app.luminabulige.com",
  "https://luminabulige.com",
]);

const te = new TextEncoder();

/* =========================
 *  CORS / JSON helpers
 * ========================= */
function corsHeaders(req: Request) {
  const origin = req.headers.get("origin");
  const isAllowed = origin && ALLOW_ORIGINS.has(origin);

  // - browser: allow only allowed origins
  // - non-browser (curl): no Origin header => allow "*"
  // - unknown origin: return "null"
  const allowOrigin = origin ? (isAllowed ? origin : "null") : "*";

  return {
    "access-control-allow-origin": allowOrigin,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization,x-signature-sha256",
    "access-control-max-age": "86400",
    "cache-control": "no-store",
    vary: "Origin",
  };
}

function json(req: Request, data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(req),
      "content-type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}

function notFound(req: Request) {
  return json(req, { ok: false, error: "Not found" }, 404);
}

function methodNotAllowed(req: Request) {
  return json(req, { ok: false, error: "Method not allowed" }, 405);
}

/* =========================
 *  Base64/Base64URL utils (Workers native)
 * ========================= */
function bytesToB64(u8: Uint8Array): string {
  // chunk to avoid call stack issues
  let s = "";
  const chunk = 0x8000;
  for (let i = 0; i < u8.length; i += chunk) {
    s += String.fromCharCode(...u8.subarray(i, i + chunk));
  }
  return btoa(s);
}

function b64ToBytes(b64: string): Uint8Array {
  // accept base64url too
  const norm = b64.replace(/-/g, "+").replace(/_/g, "/");
  const pad = norm.length % 4 === 0 ? norm : norm + "=".repeat(4 - (norm.length % 4));
  const bin = atob(pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function b64uFromBytes(bytes: ArrayBuffer | Uint8Array) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return bytesToB64(u8).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function uid(prefix = "proof") {
  const r = crypto.getRandomValues(new Uint8Array(16));
  const hex = [...r].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${prefix}_${hex}`;
}

/* =========================
 *  Proof crypto
 * ========================= */
async function sha256B64u(input: string) {
  const digest = await crypto.subtle.digest("SHA-256", te.encode(input));
  return b64uFromBytes(digest);
}

async function hmacSignB64u(secret: string, msg: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    te.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, te.encode(msg));
  return b64uFromBytes(sig);
}


function normalizeProofId(s: unknown) {
  if (typeof s !== "string") return null;
  const v = s.trim();
  if (!v) return null;
  if (!/^[a-zA-Z0-9._:-]{3,256}$/.test(v)) return null;
  return v;
}

/* =========================
 *  Wise webhook signature verify
 * ========================= */
async function importRsaPublicKeyFromPem(pem: string) {
  const clean = pem
    .replace(/-----BEGIN PUBLIC KEY-----/g, "")
    .replace(/-----END PUBLIC KEY-----/g, "")
    .replace(/\s+/g, "");

  // spki を「とにかく BufferSource として扱う」キャストを挟む

// spki（または実際の変数名）が見えているスコープ内で：
return crypto.subtle.importKey(
  "spki",
  pem as unknown as BufferSource, // ← ここだけキャスト
  { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
  false,
  ["verify"],
);

async function saveWiseEvent(env: Env, payload: any, raw: ArrayBuffer) {
  if (!env.DB) return; // DB binding 없으면保存スキップ

  const rawB64 = bytesToB64(new Uint8Array(raw));
  const eventType = payload?.eventType ?? payload?.event_type ?? null;

  await env.DB.prepare(
    `INSERT INTO wise_webhook_events (id, received_at, event_type, payload_json, raw_b64)
     VALUES (?, ?, ?, ?, ?)`
  )
    .bind(crypto.randomUUID(), Date.now(), eventType, JSON.stringify(payload), rawB64)
    .run();
}

/* =========================
 *  Router
 * ========================= */
export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;

    // OPTIONS preflight (global)
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(req) });
    }

    /* ---- health ---- */
    if (req.method === "GET" && path === "/health") {
      return json(req, {
        status: "ok",
        service: "lumi-core-api",
        timestamp: new Date().toISOString(),
      });
    }

    /* ---- core/home_state ---- */
    if (req.method === "GET" && path === "/api/v1/core/home_state") {
      const mock = (url.searchParams.get("mock") || "safe").toLowerCase();
      if (mock === "warning") return json(req, MOCK_HOME_STATE.warning);
      if (mock === "danger") return json(req, MOCK_HOME_STATE.danger);
      return json(req, MOCK_HOME_STATE.safe);
    }

    /* ---- links (Wise) ---- */
    if (req.method === "GET" && path === "/api/v1/links/wise") {
      return json(req, { url: env.WISE_REFERRAL_URL ?? "" });
    }
    if (req.method === "GET" && path === "/api/v1/links/wise_affiliate") {
      return json(req, { url: env.WISE_AFFILIATE_URL ?? "" });
    }

    /* ---- aurora simulate (placeholder) ---- */
    if (req.method === "GET" && path === "/api/v1/aurora/simulate") {
      return json(req, { ok: true });
    }

    /* =========================
     *  Proofs API
     * ========================= */

    // GET /api/proofs?proofId=xxx
    if (req.method === "GET" && path === "/api/proofs") {
      const proofId = normalizeProofId(url.searchParams.get("proofId"));
      if (!proofId) return json(req, { ok: false, error: "proofId required" }, 400);

      const rec = (await env.PROOFS.get(proofId, "json")) as ProofRow | null;
      if (!rec) return json(req, { ok: true, found: false, proofId }, 200);
      return json(req, { ok: true, found: true, proof: rec }, 200);
    }

    // POST /api/proofs  { payload:any, proofId?:string }
    if (req.method === "POST" && path === "/api/proofs") {
      let body: any = null;
      try {
        body = await req.json();
      } catch {
        return json(req, { ok: false, error: "invalid json" }, 400);
      }

      const payload = body?.payload;
      if (payload === undefined) return json(req, { ok: false, error: "payload is required" }, 400);
      if (!env.PROOF_HMAC_SECRET) return json(req, { ok: false, error: "PROOF_HMAC_SECRET missing" }, 500);

      const proofId = normalizeProofId(body?.proofId) ?? uid("proof");
      const alg: "HS256" = "HS256";
      const kid = typeof env.PROOF_KID === "string" ? env.PROOF_KID : "k1";
      const ts = Date.now();

      const payloadStr = typeof payload === "string" ? payload : JSON.stringify(payload);
      const payloadB64u = b64uFromBytes(te.encode(payloadStr));

      const hashB64u = await sha256B64u(payloadB64u);
      const signingInput = `v1.${alg}.${kid}.${ts}.${hashB64u}.${payloadB64u}`;
      const sigB64u = await hmacSignB64u(env.PROOF_HMAC_SECRET, signingInput);

      const rec: ProofRow = { proofId, alg, kid, ts, hashB64u, sigB64u, payloadB64u, version: "v1" };
      await env.PROOFS.put(proofId, JSON.stringify(rec));

      return json(req, { ok: true, proof: rec }, 200);
    }

    // GET /api/verify?proofId=xxx
    if (req.method === "GET" && path === "/api/verify") {
      const proofId = normalizeProofId(url.searchParams.get("proofId"));
      if (!proofId) return json(req, { ok: false, error: "proofId required" }, 400);

      const rec = (await env.PROOFS.get(proofId, "json")) as ProofRow | null;
      if (!rec) {
        return json(req, { ok: true, result: "UNKNOWN" satisfies Result, verified: false, error: "proof not found" }, 200);
      }
      if (!env.PROOF_HMAC_SECRET) return json(req, { ok: false, error: "PROOF_HMAC_SECRET missing" }, 500);

      const reHash = await sha256B64u(rec.payloadB64u);
      const signingInput = `v1.${rec.alg}.${rec.kid}.${rec.ts}.${reHash}.${rec.payloadB64u}`;
      const expectedSig = await hmacSignB64u(env.PROOF_HMAC_SECRET, signingInput);

      const ok = reHash === rec.hashB64u && expectedSig === rec.sigB64u;

      return json(req, {
        ok: true,
        result: (ok ? "OK" : "NG") as Result,
        verified: ok,
        proof: {
          proof_id: rec.proofId,
          created_at_ts: rec.ts,
          kid: rec.kid,
          alg: rec.alg,
          payload_hash_b64u: rec.hashB64u,
          sig_ts: rec.ts,
          status: ok ? "OK" : "NG",
        },
        kid: rec.kid,
        alg: rec.alg,
        payload_hash_b64u: rec.hashB64u,
      });
    }

    /* =========================
     *  Wise webhook
     * ========================= */
    if (path === "/webhooks/wise") {
      if (req.method !== "POST") return methodNotAllowed(req);

      const sigB64 = req.headers.get("X-Signature-SHA256");
      if (!sigB64) return json(req, { ok: false, error: "missing X-Signature-SHA256" }, 400);

      const pubPem = env.WISE_WEBHOOK_PUBLIC_KEY_PEM;
      if (!pubPem) return json(req, { ok: false, error: "WISE_WEBHOOK_PUBLIC_KEY_PEM missing" }, 500);

      const raw = await req.arrayBuffer();

      let key: CryptoKey;
      try {
        key = await importRsaPublicKeyFromPem(pubPem);
      } catch {
        return json(req, { ok: false, error: "invalid public key pem" }, 500);
      }

      const sigBytes = b64ToBytes(sigB64);
      const verified = await crypto.subtle.verify(
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        key,
        sigBytes,
        raw
      );

      if (!verified) return json(req, { ok: false, error: "invalid signature" }, 401);

      let payload: any = null;
      try {
        payload = JSON.parse(new TextDecoder().decode(raw));
      } catch {
        // WiseがJSON以外を送る可能性は低いが、一応
        payload = { _raw: bytesToB64(new Uint8Array(raw)) };
      }

      await saveWiseEvent(env, payload, raw);

      return json(req, { ok: true });
    }

    return notFound(req);
  },
};
