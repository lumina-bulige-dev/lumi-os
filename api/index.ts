const MOCK_SAFE = {
  balance_total: 320000,
  paket_bigzoon: 300000,
  floor_status: "SAFE",
  challenge: {
    day_in_challenge: 7,
    is_safe_null_today: true,
    safe_move_limit: 0,
  },
  heart: {
    risk_mode: "NORMAL",
  },
};

const MOCK_WARNING = {
  balance_total: 305000,
  paket_bigzoon: 300000,
  floor_status: "WARNING",
  challenge: {
    day_in_challenge: 15,
    is_safe_null_today: false,
    safe_move_limit: 5000,
  },
  heart: {
    risk_mode: "TIRED",
  },
};

const MOCK_DANGER = {
  balance_total: 298000,
  paket_bigzoon: 300000,
  floor_status: "DANGER",
  challenge: {
    day_in_challenge: 23,
    is_safe_null_today: false,
    safe_move_limit: 0,
  },
  heart: {
    risk_mode: "RED",
  },
};

export default {
  async fetch(req: Request, env: any) {
    const url = new URL(req.url);

    /* =========================
       0. HEALTH CHECK
    ========================= */
    if (req.method === "GET" && url.pathname === "/health") {
      return Response.json({
        status: "ok",
        service: "lumi-core-api",
        timestamp: new Date().toISOString(),
      });
    }

    /* =========================
       1. HOME STATE（MVP）
    ========================= */
    if (req.method === "GET" && url.pathname === "/api/v1/core/home_state") {
      const mock = url.searchParams.get("mock");

      if (mock === "warning") return Response.json(MOCK_WARNING);
      if (mock === "danger") return Response.json(MOCK_DANGER);

      return Response.json(MOCK_SAFE); // default
    }

    /* =========================
       2. WISE WEBHOOK
    ========================= */
    if (url.pathname === "/webhooks/wise") {
      if (req.method !== "POST") {
        return new Response("method not allowed", { status: 405 });
      }

      const raw = await req.arrayBuffer();

      const sigB64 = req.headers.get("X-Signature-SHA256");
      if (!sigB64) {
        return new Response("missing signature", { status: 400 });
      }

      const pubPem = env.WISE_WEBHOOK_PUBLIC_KEY_PEM;
      if (!pubPem) {
        return new Response("server misconfig", { status: 500 });
      }

      const key = await importRsaPublicKey(pubPem);

      const ok = await crypto.subtle.verify(
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        key,
        b64ToUint8(sigB64),
        raw
      );

      if (!ok) {
        return new Response("invalid signature", { status: 401 });
      }

      const payload = JSON.parse(new TextDecoder().decode(raw));
      await saveWiseEvent(payload, raw, env);

      return new Response("ok");
    }

    /* =========================
       9. FALLBACK
    ========================= */
    return new Response("not found", { status: 404 });
  },
};
