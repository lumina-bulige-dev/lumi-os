// functions/api/proofs.ts
// Cloudflare Pages Functions: /api/proofs
// - GET  : ?proofId=... で proof を返す（現状はモック/後でDB接続）
// - POST : payload を受け取り proof を生成して返す（現状は簡易proof生成）
// CORS込み（preflight/OPTIONS対応）

export interface ProofRecord {
  proofId: string;
  // verification meta
  alg: string;       // 例: "Ed25519" / "RS256" / etc
  kid: string;       // key id
  ts: number;        // epoch ms

  // material
  payloadB64u: string;
  hashB64u: string;
  sigB64u: string;

  // optional: human/debug
  version?: string;
}

// ===== CORS =====
const CORS_HEADERS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type,authorization",
  "access-control-max-age": "86400",
};

function json(
  data: unknown,
  init?: ResponseInit & { headers?: Record<string, string> }
) {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    ...CORS_HEADERS,
    ...(init?.headers ?? {}),
  };
  return new Response(JSON.stringify(data), { ...init, headers });
}

function b64uEncodeUtf8(str: string) {
  // Text -> base64url
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const b64 = btoa(bin);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sha256B64u(payloadB64u: string) {
  const data = new TextEncoder().encode(payloadB64u);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(digest);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const b64 = btoa(bin);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function uid(prefix = "proof") {
  // 依存なしで雑に一意っぽく（後でDB側のIDに置換推奨）
  const r = crypto.getRandomValues(new Uint8Array(16));
  const hex = [...r].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${prefix}_${hex}`;
}

// ===== TODO: DB接続に差し替えるまでの in-memory モック =====
// Pages Functions は永続を保証しないので、これは「動作確認用」。
// 本番は D1/KV/R2/Supabase/Postgres に必ず置換すること。
const mem = new Map<string, ProofRecord>();

function normalizeProofId(s: string | null) {
  if (!s) return null;
  const v = s.trim();
  if (!v) return null;
  // 変な文字を弾く（URL/ログ汚染対策の最低ライン）
  if (!/^[a-zA-Z0-9._:-]{3,256}$/.test(v)) return null;
  return v;
}

// ===== Handlers =====
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestGet: PagesFunction = async (ctx) => {
  const url = new URL(ctx.request.url);
  const proofId = normalizeProofId(url.searchParams.get("proofId"));

  if (!proofId) {
    return json(
      { ok: false, error: "proofId is required (query param)" },
      { status: 400 }
    );
  }

  // --- ここをDB読み取りに置換 ---
  const rec = mem.get(proofId);

  // デバッグ用：proofが無い場合でも、疎通確認ができるように最低限返す
  if (!rec) {
    return json(
      {
        ok: true,
        found: false,
        proofId,
        // A方式では /v は proofIdだけで来て、ここから全部揃うのが理想
        // まだ未生成なら「未生成」を明確に返す
        message: "proof not found (not generated yet)",
      },
      { status: 200 }
    );
  }

  return json({ ok: true, found: true, proof: rec }, { status: 200 });
};

export const onRequestPost: PagesFunction = async (ctx) => {
  let body: any = null;
  try {
    body = await ctx.request.json();
  } catch {
    body = null;
  }

  // 期待する入力（最小）：
  // - payload: object | string
  // - proofId?: string (任意。指定があればそれを使う。無ければ新規生成)
  const inputProofId = normalizeProofId(body?.proofId ?? null);
  const payload = body?.payload;

  if (payload === undefined) {
    return json(
      { ok: false, error: "payload is required in JSON body" },
      { status: 400 }
    );
  }

  const proofId = inputProofId ?? uid("proof");
  const ts = Date.now();

  // payload を base64url に固定化（署名前の canonical も後でここに入れる）
  const payloadStr =
    typeof payload === "string" ? payload : JSON.stringify(payload);
  const payloadB64u = b64uEncodeUtf8(payloadStr);

  // hash は payloadB64u を入力に取る（あなたの表示と揃えるため）
  const hashB64u = await sha256B64u(payloadB64u);

  // 署名は現状モック（ここを本物の署名に置換する）
  // 本番：秘密鍵で sign(hash or canonical payload) → sigB64u
  const alg = body?.alg ?? "MOCK";
  const kid = body?.kid ?? "mock_kid";
  const sigB64u =
    body?.sigB64u ??
    b64uEncodeUtf8(`mock-signature:${kid}:${alg}:${hashB64u}`);

  const rec: ProofRecord = {
    proofId,
    alg,
    kid,
    ts,
    payloadB64u,
    hashB64u,
    sigB64u,
    version: "v1",
  };

  // --- ここをDB upsertに置換 ---
  mem.set(proofId, rec);

  return json({ ok: true, proof: rec }, { status: 200 });
};
