// functions/api/sign.ts

type Env = {
  PRIVATE_JWK: string; // Cloudflare Pages の環境変数名
  SIGN_KID?: string;
};

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;

  const body = await request.json().catch(() => null);
  if (!body?.toSignB64u) {
    return Response.json({ error: "toSignB64u required" }, { status: 400 });
  }

  if (!env.PRIVATE_JWK) {
    return Response.json({ error: "PRIVATE_JWK missing" }, { status: 500 });
  }

  const kid = env.SIGN_KID || "p256-v1";
  const jwk = JSON.parse(env.PRIVATE_JWK);

  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  // 署名対象（※ここは「ハッシュ」ではなく “署名したいバイト列” を渡す）
  const dataBytes = b64uToBytes(body.toSignB64u);

  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    dataBytes
  );

  return Response.json({
    alg: "ES256",
    kid,
    sigB64u: bytesToB64u(new Uint8Array(sig)),
    ts: new Date().toISOString(),
  });
};

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
