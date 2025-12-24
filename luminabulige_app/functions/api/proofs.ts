// functions/api/proofs.ts
export type ProofRow = {
  proofId: string;
  alg: string;
  kid: string;
  ts: number;
  hashB64u: string;
  sigB64u: string;
  payloadB64u: string;
  version?: string;
};

type Env = {
  PROOFS?: KVNamespace;
  PROOF_HMAC_SECRET?: string; // Pagesの暗号化環境変数で入れる
  PROOF_KID?: string;         // 任意
};

const ALLOW_ORIGINS = new Set([
  "https://app.luminabulige.com",
  "https://luminabulige.com",
]);

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin");
  const allowed = origin && ALLOW_ORIGINS.has(origin);

  const h: Record<string, string> = {
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
    "access-control-max-age": "86400",
    "cache-control": "no-store",
    vary: "Origin",
  };

  h["access-control-allow-origin"] = allowed ? origin! : "*";
  return h;
}

function json(req: Request, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(req), "content-type": "application/json; charset=utf-8" },
  });
}

function normalizeProofId(s: unknown) {
  if (typeof s !== "string") return null;
  const v = s.trim();
  if (!v) return null;
  if (!/^[a-zA-Z0-9._:-]{3,256}$/.test(v)) return null;
  return v;
}

function uid(prefix = "proof") {
  const r = crypto.getRandomValues(new Uint8Array(16));
  const hex = [...r].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${prefix}_${hex}`;
}

const te = new TextEncoder();

function b64u(bytes: ArrayBuffer | Uint8Array) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of u8) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
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

// KV未設定でも落ちないための保険（ただしデプロイ跨ぐと消える）
const mem = new Map<string, ProofRow>();

export const onRequestOptions: PagesFunction<Env> = async ({ request }) => {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const proofId = normalizeProofId(url.searchParams.get("proofId"));
  if (!proofId) return json(request, { ok: false, error: "proofId required" }, 400);

  let rec: ProofRow | null = null;
  if (env.PROOFS) rec = (await env.PROOFS.get(proofId, "json")) as ProofRow | null;
  if (!rec) rec = mem.get(proofId) ?? null;

  if (!rec) return json(request, { ok: true, found: false, proofId }, 200);
  return json(request, { ok: true, found: true, proof: rec }, 200);
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = await request.json().catch(() => null);
  const payload = body?.payload;
  if (payload === undefined) return json(request, { ok: false, error: "payload is required" }, 400);

  const inputProofId = normalizeProofId(body?.proofId);
  const proofId = inputProofId ?? uid("proof");

  const alg = "HS256";
  const kid = typeof env.PROOF_KID === "string" ? env.PROOF_KID : "k1";
  const ts = Date.now();

  if (!env.PROOF_HMAC_SECRET) {
    return json(request, { ok: false, error: "PROOF_HMAC_SECRET missing" }, 500);
  }

  const payloadStr = typeof payload === "string" ? payload : JSON.stringify(payload);
  const payloadB64u = b64u(te.encode(payloadStr));

  const hashB64u = await sha256B64u(payloadB64u);
  const signingInput = `v1.${alg}.${kid}.${ts}.${hashB64u}.${payloadB64u}`;
  const sigB64u = await hmacSignB64u(env.PROOF_HMAC_SECRET, signingInput);

  const rec: ProofRow = { proofId, alg, kid, ts, hashB64u, sigB64u, payloadB64u, version: "v1" };

  if (env.PROOFS) await env.PROOFS.put(proofId, JSON.stringify(rec));
  else mem.set(proofId, rec);

  return json(request, { ok: true, proof: rec }, 200);
};
