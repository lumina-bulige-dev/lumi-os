// functions/api/proofs.ts
export type ProofRow = {
  proofId: string;
  alg: string;        // "HS256"
  kid: string;        // "k1" etc
  ts: number;         // epoch ms
  hashB64u: string;   // SHA-256(payloadB64u) の b64url
  sigB64u: string;    // HMAC署名の b64url
  payloadB64u: string;// payload(JSON) の b64url
  version?: string;   // "v1"
};

type Env = {
  PROOFS?: KVNamespace;
  PROOF_HMAC_SECRET?: string; // 必須（本番）
  PROOF_KID?: string;         // 任意（デフォ: k1）
};

const ALLOW_ORIGINS = new Set([
  "https://app.luminabulige.com",
  "https://luminabulige.com",
]);

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin");
  const allowed = origin ? ALLOW_ORIGINS.has(origin) : false;

  const h: Record<string, string> = {
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
    "access-control-max-age": "86400",
    "cache-control": "no-store",
    "vary": "Origin",
  };

  // origin無し（同一オリジン / curl 等）→ * でOK
  if (!origin) {
    h["access-control-allow-origin"] = "*";
  } else if (allowed) {
    // allowlist のみ許可
    h["access-control-allow-origin"] = origin;
  }
  // allowed でない origin には allow-origin を付けない（＝ブラウザがブロック）

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

// b64url（Uint8Array/ArrayBuffer → string）
function b64u(bytes: ArrayBuffer | Uint8Array) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of u8) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64uEncodeUtf8(str: string) {
  return b64u(te.encode(str));
}

async function sha256B64u(input: string) {
  const buf = await crypto.subtle.digest("SHA-256", te.encode(input));
  return b64u(buf);
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

// KV未設定でも「一応」動かすためのメモリ（本番はKV必須）
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

  // proofId（任意で外から指定も可）
  const inputProofId = normalizeProofId(body?.proofId);
  const proofId = inputProofId ?? uid("proof");

  // HMAC設定（本番必須）
  if (!env.PROOF_HMAC_SECRET) {
    return json(request, { ok: false, error: "PROOF_HMAC_SECRET missing" }, 500);
  }

  const version = "v1";
  const alg = "HS256";
  const kid = env.PROOF_KID || "k1";
  const ts = Date.now();

  const payloadStr = typeof payload === "string" ? payload : JSON.stringify(payload);
  const payloadB64u = b64uEncodeUtf8(payloadStr);

  // hash は payloadB64u を固定入力にする（検証がブレない）
  const hashB64u = await sha256B64u(payloadB64u);

  // 署名対象（固定並び）
  const signingInput = `${version}.${alg}.${kid}.${ts}.${hashB64u}.${payloadB64u}`;
  const sigB64u = await hmacSignB64u(env.PROOF_HMAC_SECRET, signingInput);

  const rec: ProofRow = { proofId, alg, kid, ts, hashB64u, sigB64u, payloadB64u, version };

  if (env.PROOFS) {
    await env.PROOFS.put(proofId, JSON.stringify(rec));
  } else {
    mem.set(proofId, rec);
  }

  return json(request, { ok: true, proof: rec }, 200);
};
