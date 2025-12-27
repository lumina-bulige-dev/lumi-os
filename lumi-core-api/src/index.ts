// src/index.ts (例)  ※Workersのエントリ
export interface Env {
  ADMIN_KEY: string;      // secret
  INVITES: KVNamespace;   // KV binding
}

type InviteRecord = {
  status: "ISSUED" | "REDEEMED";
  createdAt: number;
  expiresAt: number;
  redeemedAt?: number;
};

const SERVICE = "lumi-core-api";

function json(data: any, status = 200, extraHeaders: Record<string,string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}

function withCors(res: Response) {
  const h = new Headers(res.headers);
  h.set("Access-Control-Allow-Origin", "*");
  h.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  h.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return new Response(res.body, { status: res.status, headers: h });
}

function nowIso() { return new Date().toISOString(); }

function requireAdmin(request: Request, env: Env): boolean {
  const auth = request.headers.get("authorization") || "";
  // Bearer <ADMIN_KEY>
  return auth === `Bearer ${env.ADMIN_KEY}`;
}

// 招待トークン生成（URL安全文字）
function genToken(bytes = 18) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  // base64url
  const b64 = btoa(String.fromCharCode(...arr))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  return b64;
}

// tokenをそのままKVキーにせず、sha256でキー化（漏洩耐性ちょい上げ）
async function sha256Hex(input: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,"0")).join("");
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      // Preflight
      if (request.method === "OPTIONS") {
        return withCors(new Response(null, { status: 204 }));
      }

      const url = new URL(request.url);
      const path = url.pathname;

      // 1) health
      if (request.method === "GET" && path === "/health") {
        return withCors(json({
          status: "ok",
          service: SERVICE,
          timestamp: nowIso(),
        }));
      }

      // 2) invite issue (admin only)
      if (request.method === "POST" && path === "/invite/issue") {
        if (!requireAdmin(request, env)) {
          return withCors(json({ ok: false, error: "unauthorized" }, 401));
        }

        const body = await request.json().catch(() => ({} as any));
        const ttlDays = Math.max(1, Math.min(30, Number(body?.ttlDays ?? 7)));
        const createdAt = Date.now();
        const expiresAt = createdAt + ttlDays * 24 * 60 * 60 * 1000;

        const token = genToken();               // ユーザーに渡すコード
        const key = await sha256Hex(token);     // KVキー

        const rec: InviteRecord = { status: "ISSUED", createdAt, expiresAt };
        await env.INVITES.put(key, JSON.stringify(rec), {
          expirationTtl: ttlDays * 24 * 60 * 60, // KV側も期限で消す
        });

        return withCors(json({
          ok: true,
          token,
          ttlDays,
          expiresAt,
        }));
      }

      // 3) invite redeem (user)
      if (request.method === "POST" && path === "/invite/redeem") {
        const body = await request.json().catch(() => ({} as any));
        const token = String(body?.token ?? "").trim();
        if (!token) return withCors(json({ ok: false, error: "token_required" }, 400));

        const key = await sha256Hex(token);
        const raw = await env.INVITES.get(key);
        if (!raw) return withCors(json({ ok: false, error: "invalid_or_expired" }, 404));

        const rec = JSON.parse(raw) as InviteRecord;

        if (rec.status === "REDEEMED") {
          return withCors(json({ ok: false, error: "already_redeemed" }, 409));
        }
        if (Date.now() > rec.expiresAt) {
          // 念のため（KV TTLでも消えるが）
          await env.INVITES.delete(key);
          return withCors(json({ ok: false, error: "expired" }, 410));
        }

        rec.status = "REDEEMED";
        rec.redeemedAt = Date.now();
        // 残りTTLは短くてもOK（例：あと1日保持）
        await env.INVITES.put(key, JSON.stringify(rec), { expirationTtl: 24 * 60 * 60 });

        return withCors(json({
          ok: true,
          result: "REDEEMED",
          redeemedAt: rec.redeemedAt,
        }));
      }

      // Not found
      return withCors(json({ ok: false, error: "not_found", path }, 404));
    } catch (e: any) {
      // 500のとき中身が見えないのが一番つらいので、最低限返す
      return withCors(json({ ok: false, error: "internal_error", message: String(e?.message ?? e) }, 500));
    }
  },
};
