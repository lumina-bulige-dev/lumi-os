export const onRequestPost: PagesFunction<{
  SIGN_PRIVATE_JWK: string; // Cloudflare環境変数（Secret推奨）
  SIGN_KID?: string;
}> = async ({ request, env }) => {
  const body = await request.json().catch(() => null) as { hash?: string } | null;
  const hashHex = body?.hash;

  if (!hashHex || !/^[0-9a-f]{64}$/i.test(hashHex)) {
    return new Response(JSON.stringify({ error: "invalid hash" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const jwk = JSON.parse(env.SIGN_PRIVATE_JWK);

  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const msg = hexToBytes(hashHex);

  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    msg
  );

  return new Response(
    JSON.stringify({
      kid: env.SIGN_KID || "p256-v1",
      sigB64u: toBase64Url(new Uint8Array(sig)),
    }),
    { headers: { "content-type": "application/json" } }
  );
};

function hexToBytes(hex: string) {
  const a = new Uint8Array(hex.length / 2);
  for (let i = 0; i < a.length; i++) a[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return a;
}
function toBase64Url(bytes: Uint8Array) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
