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

  // 追加（必須）
  PROOF_HMAC_SECRET?: string; // 長めのランダム文字列

  // 任意（無ければデフォルト）
  PROOF_KID?: string; // 例: "k1"
};

const ALLOW_ORIGINS = new Set([
  "https://app.luminabulige.com",
  "https://luminabulige.com",
]);

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin");
  const allowed = origin && ALLOW_ORIGINS.has(origin);

  // credentials を使わないなら true を付けないのが最強に安全
  // （現状は不要なはず）
  const h: Record<string, string> = {
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
    "access-control-max-age": "86400",
    "cache-control": "no-store",
    "vary": "Origin",
  };

  if (allowed) {
    h["access-control-allow-origin"] = origin!;
    // cookie を使う時だけON（今はOFF推奨）
    // h["access-control-allow-credentials"] = "true";
  } else {
    // Originヘッダが無い(curl/同一オリジン)ケース向けに * を返すのはOK
    // ブラウザCORS用途では allowlist 以外には付かない
    h["access-control-allow-origin"] = "*";
  }

  return h;
}

function json(req: Request, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(req), "content-type": "application/json; charset=utf-8" },
  });
}


function b64uEncodeUtf8(str: string) {
  return b64u(new TextEncoder().encode(str));
}

async function sha256B64u(inputB64u: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(inputB64u));
  return b64u(new Uint8Array(digest));
}

function uid(prefix = "proof") {
  const r = crypto.getRandomValues(new Uint8Array(16));
  const hex = [...r].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${prefix}_${hex}`;
}

function normalizeProofId(s: unknown) {
  if (typeof s !== "string") return null;
  const v = s.trim();
  if (!v) return null;
  if (!/^[a-zA-Z0-9._:-]{3,256}$/.test(v)) return null;
  return v;
}

// 暫定メモリ（KV未導入でも一応動く）
const mem = new Map<string, ProofRow>();

export const onRequestOptions: PagesFunction<Env> = async ({ request }) => {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const proofId = normalizeProofId(url.searchParams.get("proofId"));

  if (!proofId) return json(request, { ok: false, error: "proofId required" }, 400);

  // KV → mem の順
  let rec: ProofRow | null = null;

  if (env.PROOFS) {
    rec = await env.PROOFS.get(proofId, "json") as ProofRow | null;
  }
  if (!rec) rec = mem.get(proofId) ?? null;

  if (!rec) {
    return json(request, { ok: true, found: false, proofId, message: "proof not found" }, 200);
  }
  return json(request, { ok: true, found: true, proof: rec }, 200);
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = await request.json().catch(() => null);

  const payload = body?.payload;
  if (payload === undefined) return json(request, { ok: false, error: "payload is required" }, 400);

  const inputProofId = normalizeProofId(body?.proofId);
  const proofId = inputProofId ?? uid("proof");

  const ts = Date.now();
  const alg = typeof body?.alg === "string" ? body.alg : "MOCK";
  const kid = typeof body?.kid === "string" ? body.kid : "mock_kid";

  const payloadStr = typeof payload === "string" ? payload : JSON.stringify(payload);
  const payloadB64u = b64uEncodeUtf8(payloadStr);
  const hashB64u = await sha256B64u(payloadB64u);

  // 本番は秘密鍵署名へ差し替え
  const sigB64u = b64uEncodeUtf8(`mock-signature:${kid}:${alg}:${hashB64u}`);

  const rec: ProofRow = { proofId, alg, kid, ts, payloadB64u, hashB64u, sigB64u, version: "v1" };

  if (env.PROOFS) {
    await env.PROOFS.put(proofId, JSON.stringify(rec));
  } else {
    mem.set(proofId, rec);
  }

  return json(request, { ok: true, proof: rec }, 200);
};
const te = new TextEncoder();

function b64u(bytes: ArrayBuffer | Uint8Array) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of u8) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function hmacSign(secret: string, msg: string) {
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

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  // payload を受ける
  const body = await request.json();
  const payload = body?.payload;

  const alg = "HS256";
  const kid = env.PROOF_KID || "k1";
  const ts = Date.now();

  const payloadB64u = b64u(te.encode(JSON.stringify(payload)));
  const hashBuf = await crypto.subtle.digest("SHA-256", te.encode(payloadB64u));
  const hashB64u = b64u(hashBuf);

  if (!env.PROOF_HMAC_SECRET) {
    return new Response(JSON.stringify({ ok: false, error: "PROOF_HMAC_SECRET missing" }), { status: 500 });
  }

  const signingInput = `v1.${alg}.${kid}.${ts}.${hashB64u}.${payloadB64u}`;
  const sigB64u = await hmacSign(env.PROOF_HMAC_SECRET, signingInput);

  // ここでKV保存…（既存ロジックに合わせて）
  // row = { proofId, alg, kid, ts, hashB64u, sigB64u, payloadB64u, version:"v1" }

  return new Response(JSON.stringify({ ok: true /* ... */ }), { headers: { "content-type": "application/json" } });
};
const alg = "HS256";
const kid = env.PROOF_KID || "k1";
const ts = Date.now();

const payloadB64u = b64u(te.encode(JSON.stringify(payload)));
const hashBuf = await crypto.subtle.digest("SHA-256", te.encode(payloadB64u));
const hashB64u = b64u(hashBuf);

// 署名対象（ここは固定の並びにする）
const signingInput = `v1.${alg}.${kid}.${ts}.${hashB64u}.${payloadB64u}`;

if (!env.PROOF_HMAC_SECRET) throw new Error("PROOF_HMAC_SECRET missing");
const sigB64u = await hmacSign(env.PROOF_HMAC_SECRET, signingInput);

const row: ProofRow = {
  proofId,
  alg,
  kid,
  ts,
  hashB64u,
  sigB64u,
  payloadB64u,
  version: "v1",
};

async function hmacSign(secret: string, msg: string) {
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

