export default {
  async fetch(req: Request, env: any) {
    const url = new URL(req.url);

    // health check
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "content-type": "application/json" },
      });
    }

    // wise webhook only
    if (url.pathname !== "/webhooks/wise") {
      return new Response("not found", { status: 404 });
    }

    if (req.method !== "POST") {
      return new Response("method not allowed", { status: 405 });
    }

    const raw = await req.arrayBuffer();

    const sigB64 = req.headers.get("X-Signature-SHA256");
    if (!sigB64) return new Response("missing signature", { status: 400 });

    const pubPem = env.WISE_WEBHOOK_PUBLIC_KEY_PEM;
    if (!pubPem) return new Response("server misconfig", { status: 500 });

    const key = await importRsaPublicKey(pubPem);

    const ok = await crypto.subtle.verify(
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      key,
      b64ToUint8(sigB64),
      raw
    );

    if (!ok) return new Response("invalid signature", { status: 401 });

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

  const binary = Uint8Array.from(atob(clean), c => c.charCodeAt(0));

  return crypto.subtle.importKey(
    "spki",
    binary,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
}

function b64ToUint8(b64: string) {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

async function saveWiseEvent(payload: any, raw: ArrayBuffer, env: any) {
  await env.DB.prepare(
    `INSERT INTO wise_webhook_events
     (id, received_at, event_type, payload_json, raw_b64)
     VALUES (?, ?, ?, ?, ?)`
  )
    .bind(
      crypto.randomUUID(),
      Date.now(),
      payload?.type ?? null,
      JSON.stringify(payload),
      btoa(String.fromCharCode(...new Uint8Array(raw)))
    )
    .run();
}