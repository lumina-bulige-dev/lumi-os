export default {
  async fetch(req: Request, env: any) {
    const url = new URL(req.url);
if (request.method === "GET" && url.pathname === "/health") {
  return new Response(
    JSON.stringify({
      status: "ok",
      service: "lumi-core-api",
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

    // ① ルーティング固定（最優先）
    if (url.pathname !== "/webhooks/wise") {
      return new Response("not found", { status: 404 });
    }

    // ② メソッド制限
    if (req.method !== "POST") {
      return new Response("method not allowed", { status: 405 });
    }

    // ③ raw body を先に確保
    const raw = await req.arrayBuffer();

    // ④ 署名取得
    const sigB64 = req.headers.get("X-Signature-SHA256");
    if (!sigB64) {
      return new Response("missing signature", { status: 400 });
    }

    // ⑤ 公開鍵（Secret）
    const pubPem = env.WISE_WEBHOOK_PUBLIC_KEY_PEM;
    if (!pubPem) {
      return new Response("server misconfig", { status: 500 });
    }

// ⑥ 公開鍵 import
// ⑦ 署名検証
// ⑧ 保存

const key = await importRsaPublicKey(pubPem);

    // ⑥ 署名検証
    const ok = await crypto.subtle.verify(
  {
    name: "RSASSA-PKCS1-v1_5",
    hash: "SHA-256",
  },
  key,
  b64ToUint8(sigB64),
  raw
);

    if (!ok) {
      return new Response("invalid signature", { status: 401 });
    }

    // ⑦ payload decode + 保存
    const payload = JSON.parse(new TextDecoder().decode(raw));
    await saveWiseEvent(payload, raw, env);

    return new Response("ok");
  },
};

async function importRsaPublicKey(pem: string) {
  const clean = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, "")
    .replace(/-----END PUBLIC KEY-----/, "")
    .replace(/\s+/g, "");

const binary = Uint8Array.from(
  Uint8Array.from(Buffer.from(clean, "base64"))
);

  return crypto.subtle.importKey(
    "spki",
    binary,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
}

function b64ToUint8(b64: string) {
  return new Uint8Array(Buffer.from(b64, "base64"));
}

async function saveWiseEvent(payload: any, raw: ArrayBuffer, env: any) {
  await env.DB.prepare(
    `INSERT INTO wise_webhook_events (id, received_at, event_type, payload_json, raw_b64)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(
    crypto.randomUUID(),
    Date.now(),
    payload.eventType ?? null,
    JSON.stringify(payload),
    Buffer.from(raw).toString("base64")
  ).run();
}
