import { MOCK_HOME_STATE } from "./mocks/home_state";

if (req.method === "GET" && url.pathname === "/api/v1/core/home_state") {
  const mock = url.searchParams.get("mock"); // safe/warning/danger

  if (mock === "warning") return Response.json(MOCK_HOME_STATE.warning);
  if (mock === "danger") return Response.json(MOCK_HOME_STATE.danger);
  if (mock === "safe") return Response.json(MOCK_HOME_STATE.safe);

  // mock指定なしのデフォルト（今のMVP方針でOK）
  return Response.json(MOCK_HOME_STATE.safe);
}
export interface Env {
  PROOFS: KVNamespace;
  PROOF_HMAC_SECRET: string;
  PROOF_KID?: string;
}

type ProofRow = {
  proofId: string;
  alg: string; // "HS256"
  kid: string; // "k1"
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

function cors(req: Request) {
  const origin = req.headers.get("origin");
  const allowed = origin && ALLOW_ORIGINS.has(origin);
  return {
    "access-control-allow-origin": allowed ? origin! : "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
    "access-control-max-age": "86400",
    "cache-control": "no-store",
    vary: "Origin",
    "content-type": "application/json; charset=utf-8",
  };
}

function json(req: Request, data: any, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: cors(req) });
}

function b64u(bytes: ArrayBuffer | Uint8Array) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of u8) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function uid(prefix = "proof") {
  // randomUUID が使えるならそれでもOK
  const r = crypto.getRandomValues(new Uint8Array(16));
  const hex = [...r].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${prefix}_${hex}`;
}

async function sha256B64u(input: string) {
  const digest = await crypto.subtle.digest("SHA-256", te.encode(input));
  return b64u(digest);
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
  return b64u(sig);
}

function normalizeProofId(s: unknown) {
  if (typeof s !== "string") return null;
  const v = s.trim();
  if (!v) return null;
  if (!/^[a-zA-Z0-9._:-]{3,256}$/.test(v)) return null;
  return v;
}

/** ルータに組み込む想定 */
export async function handleProofs(req: Request, env: Env): Promise<Response | null> {
  const url = new URL(req.url);

  // OPTIONS
  if (req.method === "OPTIONS" && (url.pathname === "/api/proofs" || url.pathname === "/api/verify")) {
    return new Response(null, { status: 204, headers: cors(req) });
  }

  // GET /api/proofs?proofId=xxx
  if (req.method === "GET" && url.pathname === "/api/proofs") {
    const proofId = normalizeProofId(url.searchParams.get("proofId"));
    if (!proofId) return json(req, { ok: false, error: "proofId required" }, 400);

    const rec = (await env.PROOFS.get(proofId, "json")) as ProofRow | null;
    if (!rec) return json(req, { ok: true, found: false, proofId }, 200);
    return json(req, { ok: true, found: true, proof: rec }, 200);
  }

  // POST /api/proofs  { payload: any }
  if (req.method === "POST" && url.pathname === "/api/proofs") {
    const body = await req.json().catch(() => null);
    const payload = body?.payload;
    if (payload === undefined) return json(req, { ok: false, error: "payload is required" }, 400);
    if (!env.PROOF_HMAC_SECRET) return json(req, { ok: false, error: "PROOF_HMAC_SECRET missing" }, 500);

    const proofId = normalizeProofId(body?.proofId) ?? uid("proof");

    const alg = "HS256";
    const kid = typeof env.PROOF_KID === "string" ? env.PROOF_KID : "k1";
    const ts = Date.now();

    const payloadStr = typeof payload === "string" ? payload : JSON.stringify(payload);
    const payloadB64u = b64u(te.encode(payloadStr));

    const hashB64u = await sha256B64u(payloadB64u);
    const signingInput = `v1.${alg}.${kid}.${ts}.${hashB64u}.${payloadB64u}`;
    const sigB64u = await hmacSignB64u(env.PROOF_HMAC_SECRET, signingInput);

    const rec: ProofRow = { proofId, alg, kid, ts, hashB64u, sigB64u, payloadB64u, version: "v1" };
    await env.PROOFS.put(proofId, JSON.stringify(rec));

    return json(req, { ok: true, proof: rec }, 200);
  }

  // GET /api/verify?proofId=xxx  (署名再計算で照合)
  if (req.method === "GET" && url.pathname === "/api/verify") {
    const proofId = normalizeProofId(url.searchParams.get("proofId"));
    if (!proofId) return json(req, { ok: false, error: "proofId required" }, 400);

    const rec = (await env.PROOFS.get(proofId, "json")) as ProofRow | null;
    if (!rec) return json(req, { ok: true, result: "UNKNOWN", verified: false, error: "proof not found" }, 200);
    if (!env.PROOF_HMAC_SECRET) return json(req, { ok: false, error: "PROOF_HMAC_SECRET missing" }, 500);

    const reHash = await sha256B64u(rec.payloadB64u);
    const signingInput = `v1.${rec.alg}.${rec.kid}.${rec.ts}.${reHash}.${rec.payloadB64u}`;
    const expectedSig = await hmacSignB64u(env.PROOF_HMAC_SECRET, signingInput);

    const ok = (reHash === rec.hashB64u) && (expectedSig === rec.sigB64u);

    return json(req, {
      ok: true,
      result: ok ? "OK" : "NG",
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
    }, 200);
  }

  return null;
}
