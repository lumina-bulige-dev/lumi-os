// functions/api/verify.ts
export const onRequestGet = async (ctx: any) => {
  return handleVerify(ctx, "GET");
};

export const onRequestPost = async (ctx: any) => {
  return handleVerify(ctx, "POST");
};

async function handleVerify(ctx: any, method: "GET" | "POST") {
  const { request, env } = ctx;

  try {
    const url = new URL(request.url);

    let input: any = {};
    if (method === "GET") {
      input = {
        proofId: url.searchParams.get("proofId") || undefined,
        hashB64u: url.searchParams.get("hash") || undefined,
        sigB64u: url.searchParams.get("sig") || undefined,
        kid: url.searchParams.get("kid") || undefined,
        alg: url.searchParams.get("alg") || undefined,
        ts: url.searchParams.get("ts") || undefined,
        method: "qr",
      };
    } else {
      input = await request.json();
      input.method = input.method || "api";
    }

    // 1) proofId があるならDBから正を取る（改ざんURLよりDBを優先）
    let proof: any | null = null;
    if (input.proofId && env.DB) {
      proof = await env.DB
        .prepare(
          `SELECT proof_id, user_id, created_at_ts, range_from, range_to,
                  safe_count, warning_count, danger_count, total_count,
                  ruleset_version, payload_hash_b64u, sig_b64u, kid, alg, sig_ts, status
             FROM proofs
            WHERE proof_id = ?`
        )
        .bind(input.proofId)
        .first();
    }

    const hashB64u = proof?.payload_hash_b64u || input.hashB64u;
    const sigB64u = proof?.sig_b64u || input.sigB64u;
    const kid = proof?.kid || input.kid;
    const alg = proof?.alg || input.alg;

    if (!hashB64u || !sigB64u || !kid || !alg) {
      return json(
        {
          ok: false,
          result: "NG",
          error: "missing_params",
          need: ["hashB64u", "sigB64u", "kid", "alg"],
          got: { hashB64u: !!hashB64u, sigB64u: !!sigB64u, kid: !!kid, alg: !!alg },
        },
        400
      );
    }

    // 2) 失効チェック（proofがDBにある場合）
    if (proof && proof.status === "REVOKED") {
      await writeVerificationLog(env, {
        proofId: proof.proof_id,
        payloadHashB64u: hashB64u,
        kid,
        alg,
        result: "REVOKED",
        method: input.method || "qr",
        request,
      });
      return json(
        {
          ok: true,
          result: "REVOKED",
          proof: summarizeProof(proof),
        },
        200
      );
    }


    // 3) 公開鍵取得（keysテーブル or env.JWKS）
    const publicJwk = await getPublicJwk(env, kid);
    if (!publicJwk) {
      await writeVerificationLog(env, {
        proofId: proof?.proof_id,
        payloadHashB64u: hashB64u,
        kid,
        alg,
        result: "UNKNOWN",
        method: input.method || "qr",
        request,
      });

      return json(
        {
          ok: false,
          result: "UNKNOWN",
          error: "kid_not_found",
          kid,
        },
        404
      );
    }

 
// 4) verify
const verified = await verifySig({ hashB64u, sigB64u, alg, jwk: publicJwk });
const result: "OK" | "NG" = verified ? "OK" : "NG";

// 5) proofが無いけどhash一致のproofが存在するか検索（QRだけのケースを強化）
let matchedProof: any | null = proof;
if (!matchedProof && env.DB) {
  matchedProof = await env.DB
    .prepare(
      `SELECT proof_id, user_id, created_at_ts, range_from, range_to,
              safe_count, warning_count, danger_count, total_count,
              ruleset_version, payload_hash_b64u, sig_b64u, kid, alg, sig_ts, status
         FROM proofs
        WHERE payload_hash_b64u = ?`
    )
    .bind(hashB64u)
    .first();
}

await writeVerificationLog(env, {
  proofId: matchedProof?.proof_id,
  payloadHashB64u: hashB64u,
  kid,
  alg,
  result,
  method: input.method || "qr",
  request,
});

await appendHeiankyo(env, matchedProof?.user_id, {
  type: "proof.verified",
  ts: Date.now(),
  proof_id: matchedProof?.proof_id,
  data: {
    result,
    payload_hash_b64u: hashB64u,
    kid,
    alg,
  },
  request,
}); // ← ここが重要。 "}," じゃなくて "});"

return json(
  {
    ok: true,
    result,
    verified,
    proof: matchedProof ? summarizeProof(matchedProof) : null,
    kid,
    alg,
    payload_hash_b64u: hashB64u,
  },
  200
);

/* -----------------------
 * Crypto helpers
 * --------------------- */

function b64uToBytes(b64u: string): Uint8Array {
  // base64url -> base64
  const b64 = b64u.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((b64u.length + 3) % 4);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function importPublicKey(alg: string, jwk: any): Promise<CryptoKey> {
  if (!crypto?.subtle?.importKey) throw new Error("no_webcrypto_importKey");

  if (alg === "EdDSA") {
    // Ed25519
    return await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "Ed25519" },
      true,
      ["verify"]
    );
  }

  if (alg === "ES256") {
    return await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["verify"]
    );
  }

  throw new Error(`unsupported_alg:${alg}`);
}
function u8ToArrayBuffer(u8: Uint8Array): ArrayBuffer {
  const ab = new ArrayBuffer(u8.byteLength);
  new Uint8Array(ab).set(u8);
  return ab;
}

async function verifySig(params: { hashB64u: string; sigB64u: string; alg: string; jwk: any }) {
  const msgU8 = b64uToBytes(params.hashB64u);
  const sigU8 = b64uToBytes(params.sigB64u);

  const msgAB = u8ToArrayBuffer(msgU8);
  const sigAB = u8ToArrayBuffer(sigU8);

  const key = await importPublicKey(params.alg, params.jwk);

  if (params.alg === "EdDSA") {
    return await crypto.subtle.verify({ name: "Ed25519" }, key, sigAB, msgAB);
  }
  if (params.alg === "ES256") {
    return await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, key, sigAB, msgAB);
  }
  return false;
}

/* -----------------------
 * Key source (D1 or env.JWKS)
 * --------------------- */

async function getPublicJwk(env: any, kid: string): Promise<any | null> {
  // 1) D1 keys table
  if (env.DB) {
    const row = await env.DB.prepare(`SELECT public_jwk FROM keys WHERE kid = ? AND is_active = 1`)
      .bind(kid)
      .first();
    if (row?.public_jwk) return JSON.parse(row.public_jwk);
  }

  // 2) env.JWKS (JSON string)
  if (env.JWKS) {
    const jwks = JSON.parse(env.JWKS);
    const k = (jwks.keys || []).find((x: any) => x.kid === kid);
    if (k) return k;
  }

  return null;
}

/* -----------------------
 * Logging (D1)
 * --------------------- */

async function writeVerificationLog(
  env: any,
  p: {
    proofId?: string;
    payloadHashB64u: string;
    kid: string;
    alg: string;
    result: "OK" | "NG" | "REVOKED" | "UNKNOWN";
    method: string;
    request: Request;
  }
) {
  if (!env.DB) return;

  const now = Date.now();
  const verifyId = ulidLike(now);

  const ip = (p.request.headers.get("cf-connecting-ip") || "").trim();
  const ua = (p.request.headers.get("user-agent") || "").trim();

  const ipHash = ip ? await sha256B64u(env.LOG_SALT || "salt", ip) : null;
  const uaHash = ua ? await sha256B64u(env.LOG_SALT || "salt", ua) : null;

  await env.DB.prepare(
    `INSERT INTO verification_logs
      (verify_id, proof_id, payload_hash_b64u, kid, alg, ts, result, method, ip_hash_b64u, ua_hash_b64u)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(verifyId, p.proofId || null, p.payloadHashB64u, p.kid, p.alg, now, p.result, p.method, ipHash, uaHash)
    .run();
}

/* -----------------------
 * Heiankyo append-only
 * --------------------- */

async function appendHeiankyo(
  env: any,
  userId: string | undefined,
  ev: { type: string; ts: number; proof_id?: string; data: any; request: Request }
) {
  if (!env.DB || !userId) return;

  // 直前hash（ユーザー単位チェーン）
  const last = await env.DB
    .prepare(`SELECT hash_b64u FROM heiankyo_events WHERE user_id = ? ORDER BY ts DESC LIMIT 1`)
    .bind(userId)
    .first();

  const prev = last?.hash_b64u || "";

  const eventId = ulidLike(ev.ts);
  const ip = (ev.request.headers.get("cf-connecting-ip") || "").trim();
  const ua = (ev.request.headers.get("user-agent") || "").trim();
  const ipHash = ip ? await sha256B64u(env.LOG_SALT || "salt", ip) : null;
  const uaHash = ua ? await sha256B64u(env.LOG_SALT || "salt", ua) : null;

  const dataJson = canonicalJson({
    event_id: eventId,
    user_id: userId,
    type: ev.type,
    ts: ev.ts,
    proof_id: ev.proof_id || null,
    data: ev.data,
  });

  const hashB64u = await sha256B64u("", dataJson + "|" + prev);

  await env.DB.prepare(
    `INSERT INTO heiankyo_events
      (event_id, user_id, type, ts, data_json, proof_id, prev_hash_b64u, hash_b64u, ip_hash_b64u, ua_hash_b64u)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(eventId, userId, ev.type, ev.ts, dataJson, ev.proof_id || null, prev || null, hashB64u, ipHash, uaHash)
    .run();
}

/* -----------------------
 * Utils
 * --------------------- */

function summarizeProof(p: any) {
  return {
    proof_id: p.proof_id,
    created_at_ts: p.created_at_ts,
    range: { from: p.range_from, to: p.range_to },
    counts: { SAFE: p.safe_count, WARNING: p.warning_count, DANGER: p.danger_count, total: p.total_count },
    ruleset_version: p.ruleset_version,
    payload_hash_b64u: p.payload_hash_b64u,
    kid: p.kid,
    alg: p.alg,
    sig_ts: p.sig_ts,
    status: p.status,
  };
}

function canonicalJson(obj: any): string {
  // key sort (recursive)
  return JSON.stringify(sortKeys(obj));
}
function sortKeys(x: any): any {
  if (Array.isArray(x)) return x.map(sortKeys);
  if (x && typeof x === "object") {
    const out: any = {};
    for (const k of Object.keys(x).sort()) out[k] = sortKeys(x[k]);
    return out;
  }
  return x;
}

async function sha256B64u(prefix: string, s: string): Promise<string> {
  const bytes = new TextEncoder().encode(prefix + s);
  const ab = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ab).set(bytes);
  const hash = await crypto.subtle.digest("SHA-256", ab);
  return bytesToB64u(new Uint8Array(hash));
}
function bytesToB64u(bytes: Uint8Array) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

// ULID “風”で十分（厳密ULIDでなくてもIDとしてOK）
function ulidLike(ts: number) {
  return `${ts.toString(36)}_${Math.random().toString(36).slice(2, 10)}_${Math.random().toString(36).slice(2, 10)}`;
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
