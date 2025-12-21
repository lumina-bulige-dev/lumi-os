export const onRequestPost: PagesFunction<{
  SIGN_PRIVATE_JWK: string;
  SIGN_KID?: string;
}> = async ({ request, env }) => {
  const body = await request.json().catch(() => null);
  if (!body?.hashB64u) {
    return Response.json({ error: "hashB64u required" }, { status: 400 });
  }

  const kid = env.SIGN_KID || "p256-v1";
  const jwk = JSON.parse(env.SIGN_PRIVATE_JWK);

  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const hashBytes = b64uToBytes(body.hashB64u);

  // ES256: ECDSA(P-256) + SHA-256 の組。ここでは「hashBytesをそのまま署名」ではなく
  // 署名対象を “バイト列” として扱う（後段のclient側も同じバイト列を作るのが重要）
  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    hashBytes
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
