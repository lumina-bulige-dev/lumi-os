export const onRequestGet: PagesFunction<{
  SIGN_PUBLIC_JWK: string;
}> = async ({ request, env }) => {
  const url = new URL(request.url);
  const hashHex = url.searchParams.get("hash") || "";
  const sigB64u = url.searchParams.get("sig") || "";

  if (!/^[0-9a-f]{64}$/i.test(hashHex) || !sigB64u) {
    return new Response(JSON.stringify({ ok: false, error: "bad params" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const pub = await crypto.subtle.importKey(
    "jwk",
    JSON.parse(env.SIGN_PUBLIC_JWK),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["verify"]
  );

  const ok = await crypto.subtle.verify(
    { name: "ECDSA", hash: "SHA-256" },
    pub,
    fromBase64Url(sigB64u),
    hexToBytes(hashHex)
  );

  return new Response(JSON.stringify({ ok }), {
    headers: { "content-type": "application/json" },
  });
};

function hexToBytes(hex: string) {
  const a = new Uint8Array(hex.length / 2);
  for (let i = 0; i < a.length; i++) a[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return a;
}
function fromBase64Url(b64u: string) {
  const b64 = b64u.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((b64u.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
