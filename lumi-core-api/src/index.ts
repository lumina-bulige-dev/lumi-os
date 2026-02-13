// src/index.ts
export interface Env {
  // secrets
  ADMIN_KEY?: string;
  INVITE_SIGNING_KEY?: string;
  PROOFS_JWKS?: string;

  // D1 binding（Cloudflare Dashboardで設定した名前に合わせる）
  lumi_core: D1Database;
  PROOFS: KVNamespace;
}
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
function normPath(pathname: string) {
  // 1) /api/v1 を吸収
  let p = pathname.replace(/^\/api\/v1(?=\/|$)/, "");
  // 2) 末尾スラッシュ吸収（ルート"/"は除外）
  if (p.length > 1) p = p.replace(/\/+$/, "");
  // 3) 空なら "/" に
  if (!p) p = "/";
  return p;
}
function hasAdmin(env: Env, req: Request, url: URL) {
  // 正本：Authorization Bearer
  const auth = req.headers.get("Authorization") || "";
  const bearerOk =
    env.ADMIN_KEY &&
    auth.startsWith("Bearer ") &&
    auth.slice("Bearer ".length) === env.ADMIN_KEY;
  // 一時逃げ道：クエリ admin（後で削除）
  const q = url.searchParams.get("admin");
  const queryOk = env.ADMIN_KEY && q && q === env.ADMIN_KEY;
  return Boolean(bearerOk || queryOk);
}
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...corsHeaders,
    },
  });
}
function text(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      ...corsHeaders,
    },
  });
}
async function readBody(req: Request) {
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("application/json")) return await req.json().catch(() => null);
  if (ct.includes("application/x-www-form-urlencoded")) {
    const t = await req.text();
    return Object.fromEntries(new URLSearchParams(t));
  }
  // それ以外：テキスト（POST推奨なので一旦これでOK）
  return await req.text().catch(() => "");
}
// --- ここから invite 実装（MVP） ---
// ※ 署名方式は後で差し替えOK。いまは「動く + debugできる」を優先。
function signInviteToken(payload: any, env: Env) {
  // TODO: 本命は HMAC/Ed25519 などにする
  // いまは「キーが入ってるか」確認しつつダミー署名
  const key = env.INVITE_SIGNING_KEY || "";
  const raw = JSON.stringify(payload);
  // 超簡易：長さで変化させるダミー（※セキュアではない）
  const sig = btoa(`${raw.length}:${key.length}`).replace(/=+$/g, "");
  return sig;
}
function verifyInviteToken(token: string, env: Env) {
  // TODO: 本命は sign と整合する検証を実装
  // いまは token の構造チェックだけ（デバッグ用）
  if (!env.INVITE_SIGNING_KEY) {
    return { ok: false, reason: "missing INVITE_SIGNING_KEY" };
  }
  if (!token || token.length < 10) {
    return { ok: false, reason: "token too short" };
  }
  return { ok: true };
}
const textEncoder = new TextEncoder();
function base64UrlDecode(input: string) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
function parseJws(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, signatureB64] = parts;
  try {
    const headerJson = new TextDecoder().decode(base64UrlDecode(headerB64));
    const header = JSON.parse(headerJson) as { alg?: string; kid?: string };
    const signature = base64UrlDecode(signatureB64);
    return { header, signingInput: `${headerB64}.${payloadB64}`, signature };
  } catch {
    return null;
  }
}
function parseJwsPayload(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const payloadB64 = parts[1];
  try {
    const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadB64));
    return JSON.parse(payloadJson) as Record<string, unknown>;
  } catch {
    return null;
  }
}
async function loadJwkForKid(kid: string, jwksJson: string | undefined) {
  if (!jwksJson) return null;
  try {
    const data = JSON.parse(jwksJson) as { keys?: Array<Record<string, unknown>> };
    const found = data?.keys?.find((key) => key.kid === kid);
    if (!found) return null;
    if (found.kty !== "OKP" || found.crv !== "Ed25519") return null;
    if (typeof found.x !== "string") return null;
    const keyData = { ...found, key_ops: ["verify"] };
    return crypto.subtle.importKey(
      "jwk",
      keyData as JsonWebKey,
      { name: "Ed25519" },
      false,
      ["verify"]
    );
  } catch {
    return null;
  }
}
async function verifyProof(token: string, env: Env) {
  const parsed = parseJws(token);
  if (!parsed) return { ok: false };
  if (parsed.header.alg !== "EdDSA" || typeof parsed.header.kid !== "string") {
    return { ok: false };
  }
  const key = await loadJwkForKid(parsed.header.kid, env.PROOFS_JWKS);
  if (!key) return { ok: false };
  const data = textEncoder.encode(parsed.signingInput);
  const ok = await crypto.subtle.verify({ name: "Ed25519" }, key, parsed.signature, data);
  return { ok };
}
// --- handlers ---
async function handleDebug(req: Request, env: Env) {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const normalized = normPath(pathname);
  const auth = req.headers.get("Authorization") || "";
  const authKind = auth ? (auth.startsWith("Bearer ") ? "bearer" : "other") : "none";
  // 値は絶対に出さない。存在と長さだけ。
  const out = {
    now: new Date().toISOString(),
    method: req.method,
    host: url.host,
    pathname,
    normalized_path: normalized,
    search: url.search || "",
    headers: {
      "content-type": req.headers.get("content-type") || "",
      authorization: authKind,
      "user-agent": req.headers.get("user-agent") || "",
    },
    env: {
      DATA_MODE: env.DATA_MODE || "",
      has_ADMIN_KEY: Boolean(env.ADMIN_KEY),
      ADMIN_KEY_len: env.ADMIN_KEY ? env.ADMIN_KEY.length : 0,
      has_INVITE_SIGNING_KEY: Boolean(env.INVITE_SIGNING_KEY),
      INVITE_SIGNING_KEY_len: env.INVITE_SIGNING_KEY ? env.INVITE_SIGNING_KEY.length : 0,
    },
    admin_ok: hasAdmin(env, req, url),
    tips: [
      "not found が出る場合：normalized_path と期待ルートが一致してるかを見る",
      "unauthorized が出る場合：Authorization Bearer か ?admin= のどちらかが一致してるかを見る",
      "INVITE_SIGNING_KEY が空だと verify が落ちる（debugに has_INVITE_SIGNING_KEY が出る）",
    ],
  };
  // /debug は本来 admin 保護推奨。いまは焦げ付き回避で「無認証でも見れる」でもOK。
  // ただし将来は if (!hasAdmin(...)) 401 にする。
  return json(out, 200);
}
async function handleInviteIssue(req: Request, env: Env) {
  const url = new URL(req.url);
  if (req.method !== "POST") return text("method not allowed", 405);
  if (!hasAdmin(env, req, url)) return text("unauthorized", 401);
  const body = await readBody(req);
  const now = Date.now();
  const payload = {
    v: 1,
    iat: now,
    // ここに「誰に出した招待か」など入れてOK（メール等）
    sub: (body && (body.email || body.sub || body.user)) ?? "unknown",
    // 期限など
    exp: now + 1000 * 60 * 60 * 24 * 7, // 7 days
  };
  const sig = signInviteToken(payload, env);
  const token = btoa(JSON.stringify(payload)).replace(/=+$/g, "") + "." + sig;
  return json(
    {
      ok: true,
      token,
      verify_url: `${url.origin}/invite/verify?token=${encodeURIComponent(token)}`,
      payload,
    },
    200
  );
}
async function handleInviteVerify(req: Request, env: Env) {
  const url = new URL(req.url);
  // GET/HEAD は「URL検証」用の補助として 200 ok を返しても良い
  // ただし invite verify 自体は POST 推奨（長い/事故回避）
  if (req.method === "HEAD" || req.method === "GET") {
    // token が無いなら案内だけ返す
    const token = url.searchParams.get("token");
    if (!token) return json({ ok: false, error: "token required (POST recommended)" }, 400);
    const v = verifyInviteToken(token, env);
    if (!v.ok) return json({ ok: false, error: v.reason }, 401);
    return json({ ok: true, result: "OK" }, 200);
  }
  if (req.method !== "POST") return text("method not allowed", 405);
  const body = await readBody(req);
  const token = (body && (body.token || body.invite || body.t)) || url.searchParams.get("token");
  if (!token || typeof token !== "string") return json({ ok: false, error: "token required" }, 400);
  const v = verifyInviteToken(token, env);
  if (!v.ok) return json({ ok: false, error: v.reason }, 401);
  return json({ ok: true, result: "OK" }, 200);
}
type ShareReceipt = {
  token: string;
  [key: string]: unknown;
};
type ReportReceipt = {
  token: string;
  [key: string]: unknown;
};
type ConsentReceipt = {
  token: string;
  presence_only?: boolean;
  importance?: string;
  [key: string]: unknown;
};
function hasString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}
function invalidQuery() {
  return json({ error: "invalid_query" }, 400);
}
function receiptNotFound() {
  return json({ error: "receipt_not_found", verification: { result: "UNKNOWN", reason: "missing" } }, 404);
}
function tokenExpired() {
  return json({ error: "token_expired", verification: { result: "UNKNOWN", reason: "expired" } }, 410);
}
function signatureInvalid() {
  return json({ error: "signature_invalid", verification: { result: "NG", reason: "signature_invalid" } }, 422);
}
async function handleVerifyReport(req: Request, env: Env) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) return invalidQuery();
  const shareKey = `proof:v1:share:${token}`;
  const shareReceipt = await env.PROOFS.get<ShareReceipt>(shareKey, "json");
  if (!shareReceipt) return receiptNotFound();
  if (!hasString(shareReceipt.token)) return signatureInvalid();
  const shareVerification = await verifyProof(shareReceipt.token, env);
  if (!shareVerification.ok) return signatureInvalid();
  const sharePayload = parseJwsPayload(shareReceipt.token);
  if (!sharePayload || !hasString(sharePayload.report_id)) return signatureInvalid();
  if (hasString(sharePayload.expires_at)) {
    const expiresAt = Date.parse(sharePayload.expires_at);
    if (Number.isNaN(expiresAt)) return signatureInvalid();
    if (Date.now() > expiresAt) return tokenExpired();
  }
  const reportKey = `proof:v1:report:${sharePayload.report_id}`;
  const reportReceipt = await env.PROOFS.get<ReportReceipt>(reportKey, "json");
  if (!reportReceipt) return receiptNotFound();
  if (!hasString(reportReceipt.token)) return signatureInvalid();
  const reportVerification = await verifyProof(reportReceipt.token, env);
  if (!reportVerification.ok) return signatureInvalid();
  const reportPayload = parseJwsPayload(reportReceipt.token);
  if (!reportPayload) return signatureInvalid();
  return json(
    {
      verification: { result: "OK" },
      report: {
        report_id: sharePayload.report_id,
        doc_fingerprint: reportPayload.doc_fingerprint ?? null,
        issued_at: reportPayload.issued_at ?? null,
        issuer: reportPayload.issuer ?? null,
        ledger_log_id: reportPayload.ledger_log_id ?? null,
      },
      disclaimer: { proof_only: true },
    },
    200
  );
}
async function handleVerifyConsent(req: Request, env: Env) {
  const url = new URL(req.url);
  const subjectUserId = url.searchParams.get("subject_user_id");
  const counterpartyHash = url.searchParams.get("counterparty_hash");
  if (!subjectUserId || !counterpartyHash) return invalidQuery();
  const key = `proof:v1:consent:sub:${subjectUserId}:cp:${counterpartyHash}`;
  const receipt = await env.PROOFS.get<ConsentReceipt>(key, "json");
  if (!receipt) return receiptNotFound();
  if (!hasString(receipt.token)) return signatureInvalid();
  const verification = await verifyProof(receipt.token, env);
  if (!verification.ok) return signatureInvalid();
  const payload = parseJwsPayload(receipt.token);
  if (!payload) return signatureInvalid();
  return json(
    {
      presence: "present",
      verification: { result: "OK" },
      consent: {
        presence_only: true,
        importance: "low",
        status: payload.status ?? null,
        accepted_at: payload.accepted_at ?? null,
        revoked_at: payload.revoked_at ?? null,
        masked_phone: payload.masked_phone ?? null,
        ledger_log_id: payload.ledger_log_id ?? null,
      },
      disclaimer: { proof_only: true },
    },
    200
  );
}
type EventAppendBody = {
  // 誰のチェーンか（ユーザー単位）
  user_id: string;

  // イベント種別（例: "claim", "comment", "azr_message" など）
  type: string;

  // そのイベントの中身（JSONで何でも）
  payload?: any;

  // 任意：クライアント側で持つ idempotency key（重複防止に使える）
  nonce?: string;

  // 任意：前のイベントhash（チェーンしたいなら）
  prev?: string;
};

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", te.encode(s));
  const bytes = new Uint8Array(buf);
  let out = "";
  for (const b of bytes) out += b.toString(16).padStart(2, "0");
  return out;
}

function nowMs() {
  return Date.now();
}

async function handleEventAppend(req: lumi_core, env: Env) {
  const url = new URL(req.url);

  // MVPは POST のみ（読み出しは後で）
  if (req.method !== "POST") return text("method not allowed", 405);

  // いったん admin only にして事故らないようにする（後で invite token に切替OK）
  if (!hasAdmin(env, req)) return text("unauthorized", 401);

  const body = (await readBody(req)) as EventAppendBody;

  // 最低限チェック
  if (!body?.user_id || typeof body.user_id !== "string") return json({ ok: false, error: "user_id required" }, 400);
  if (!body?.type || typeof body.type !== "string") return json({ ok: false, error: "type required" }, 400);

  const t = nowMs();

  // チェーンの “素材” を正規化（順序固定＆文字列化）
  const canonical = JSON.stringify({
    v: 1,
    user_id: body.user_id,
    type: body.type,
    prev: body.prev ?? null,
    nonce: body.nonce ?? null,
    ts: t,
    payload: body.payload ?? null,
  });

  const hash = await sha256Hex(canonical);

  // D1へ append-only 保存（上書きしない）
  // ※テーブルは次ステップで作る（events）
  await env.DB.prepare(
    `INSERT INTO events (user_id, ts, type, prev, nonce, payload_json, hash)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      body.user_id,
      t,
      body.type,
      body.prev ?? null,
      body.nonce ?? null,
      JSON.stringify(body.payload ?? null),
      hash
    )
    .run();

  return json(
    {
      ok: true,
      user_id: body.user_id,
      ts: t,
      hash,
      prev: body.prev ?? null,
      next_hint: `${url.origin}/event?user_id=${encodeURIComponent(body.user_id)}`, // 後でGET作る用
    },
    200
  );
}

export default {
  async fetch(req: Request, env: Env) {
    const url = new URL(req.url);
    const p = normPath(url.pathname);
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (p === "/event") return handleEventAppend(req, env);
    
    // --- core routes ---
    if (p === "/health") {
      return json({
        status: "ok",
        service: "lumi-core-api",
        timestamp: new Date().toISOString(),
      });
    }
    if (p === "/debug") {
      return handleDebug(req, env);
    }
    if (p === "/invite/issue") {
      return handleInviteIssue(req, env);
    }
    if (p === "/invite/verify") {
      return handleInviteVerify(req, env);
    }
    if (p === "/verify/report" && req.method === "GET") {
      return handleVerifyReport(req, env);
    }
    if (p === "/verify/consent" && req.method === "GET") {
      return handleVerifyConsent(req, env);
    }
    return text("Not found", 404);
  },
};
