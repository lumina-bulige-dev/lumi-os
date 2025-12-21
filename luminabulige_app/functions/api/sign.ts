// functions/api/verify.ts

type Env = {
  PUBLIC_JWK: string; // Cloudflare Pages の環境変数名（公開鍵JWKのJSON文字列）
};

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;

  if (!env.PUBLIC_JWK) {
    return Response.json({ ok: false, error: "PUBLIC_JWK missing" }, { status: 500 });
  }

  const url = new URL(request.url);
  const toSignB64u = url.searchParams.get("toSignB64u");
  const sigB64u = url.searchParams.get("sigB64u");

  if (!toSignB64u || !sigB64u) {
    return Response.json(
      { ok: false, error: "toSignB64u and sigB64u are required" },
      { status: 400 }
    );
  }

  const jwk = JSON.parse(env.PUBLIC_JWK);

  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["verify"]
  );

  const dataBytes = b64uToBytes(toSignB64u);
  const sigBytes = b64uToBytes(sigB64u);

  const ok = await crypto.subtle.verify(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    sigBytes,
    dataBytes
  );

  return Response.json({ ok });
};

function b64uToBytes(b64u: string) {
  const b64 = b64u.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((b64u.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
