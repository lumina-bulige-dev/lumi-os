export const onRequestPost = async ({ request, env }: any) => {
  try {
    const body = await request.json().catch(() => null);
    if (!body?.hashB64u) {
      return json({ error: "hashB64u required" }, 400);
    }

    // ★ env名を統一：PRIVATE_JWK / SIGN_KID
    if (!env.PRIVATE_JWK) {
      return json({ error: "PRIVATE_JWK is missing" }, 500);
    }

    const kid = env.SIGN_KID || "p256-v1";

    let jwk: any;
    try {
      jwk = JSON.parse(env.PRIVATE_JWK);
    } catch {
      return json({ error: "PRIVATE_JWK is not valid JSON" }, 500);
    }

    // ★ d が無い=秘密鍵じゃない
    if (!jwk.d) {
      return json({ error: "PRIVATE_JWK has no 'd' (looks like public key or broken copy)" }, 500);
    }

    const key = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["sign"]
    );

    const hashBytes = b64uToBytes(body.hashB64u);

    const sig = await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      key,
      hashBytes
    );

    return json(
      {
        alg: "ES256",
        kid,
        sigB64u: bytesToB64u(new Uint8Array(sig)),
        ts: new Date().toISOString(),
      },
      200
    );
  } catch (e: any) {
    // ★ ここで落ちた理由が見える
    return json({ error: "sign failed", message: e?.message || String(e) }, 500);
  }
};

function json(obj: any, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function bytesToB64u(bytes: Uint8Array) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64uToBytes(b64u: string) {
  const b64 = b64u.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((b64u.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
