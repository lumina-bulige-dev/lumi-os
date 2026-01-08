// src/index.ts
import { MOCK_HOME_STATE } from "./mocks/home_state";

export interface Env {
  ADMIN_KEY?: string;          // secret推奨
  INVITE_SIGNING_KEY?: string; // secret推奨（署名キー）
  DATA_MODE?: string;          // "mock" など
  WISE_REFERRAL_URL?: string;  // Wise紹介リンク
}
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
      "Access-Control-Allow-Origin": "*",
    },
  });
}
function text(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
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

// --- Core OS Policy API handlers ---

/**
 * GET /api/v1/core/home_state
 * ホーム画面のための まとめ値 API
 */
async function handleHomeState(req: Request, env: Env) {
  if (req.method !== "GET") return text("method not allowed", 405);
  
  // MVP: mock data mode
  if (env.DATA_MODE === "mock" || !env.DATA_MODE) {
    // デフォルトは "safe" を返す
    // クエリパラメータで状態を切り替え可能（デバッグ用）
    const url = new URL(req.url);
    const state = url.searchParams.get("state") || "safe";
    
    if (state === "warning" && MOCK_HOME_STATE.warning) {
      return json(MOCK_HOME_STATE.warning, 200);
    }
    if (state === "danger" && MOCK_HOME_STATE.danger) {
      return json(MOCK_HOME_STATE.danger, 200);
    }
    
    return json(MOCK_HOME_STATE.safe, 200);
  }
  
  // TODO: 本番実装（データベース連携など）
  return json({ error: "not implemented" }, 501);
}

/**
 * POST /api/v1/os/reaction
 * state_t + action_t → state_{t+1} 計算エンジン
 */
async function handleReaction(req: Request, env: Env) {
  if (req.method !== "POST") return text("method not allowed", 405);
  
  const body = await readBody(req);
  if (!body || !body.state || !body.action) {
    return json({ error: "state and action required" }, 400);
  }
  
  const state = body.state;
  const action = body.action;
  const options = body.options || {};
  
  // MVP: 簡易計算ロジック
  const balance_after = state.balance_total - action.amount;
  const paket_floor = state.paket_floor || 250000;
  
  // safety_gap の計算
  const safety_gap_before = state.balance_total - paket_floor;
  const safety_gap_after = balance_after - paket_floor;
  const delta_gap = safety_gap_after - safety_gap_before;
  
  // floor_status の判定
  let floor_status_before = "SAFE";
  let floor_status_after = "SAFE";
  
  if (safety_gap_before <= 0) floor_status_before = "RED";
  else if (safety_gap_before <= 20000) floor_status_before = "WARN";
  
  if (safety_gap_after <= 0) floor_status_after = "RED";
  else if (safety_gap_after <= 20000) floor_status_after = "WARN";
  
  // risk_score の更新（簡易版）
  const risk_score_delta = Math.floor((action.amount / state.balance_total) * 10);
  const risk_score_after = Math.min(100, (state.risk_score || 0) + risk_score_delta);
  
  // hidden_cost の更新
  const hidden_cost_after = (state.hidden_cost_month || 0) + 
    (action.fee_effective || 0) * action.amount;
  
  // zone 判定（Aurora / Twilight / Dark）
  const getZone = (gap: number) => {
    if (gap > 50000) return "Aurora";
    if (gap > 20000) return "Twilight";
    return "Dark";
  };
  
  const response: any = {
    state_before: state,
    state_after: {
      balance_total: balance_after,
      paket_floor,
      fixed_must: state.fixed_must,
      living_min: state.living_min,
      risk_score: risk_score_after,
      hidden_cost_month: hidden_cost_after,
    },
    metrics: {
      delta_gap,
      safety_gap_before,
      safety_gap_after,
      floor_status_before,
      floor_status_after,
      zone_before: getZone(safety_gap_before),
      zone_after: getZone(safety_gap_after),
    },
    alerts: [] as any[],
  };
  
  // アラートの生成
  if (floor_status_after === "RED") {
    response.alerts.push({
      level: "danger",
      code: "FLOOR_RED",
      message: "この支払いで床を下回ります。実行は推奨されません。",
    });
  } else if (floor_status_after === "WARN") {
    response.alerts.push({
      level: "warning",
      code: "FLOOR_WARN",
      message: `この支払いで、床との距離が ${safety_gap_after.toLocaleString()} 円まで近づきます。`,
    });
  }
  
  // router_decision（オプション）
  if (options.include_router_decision && action.fee_candidate_list) {
    const fee_current = action.fee_current || 0;
    const candidates = action.fee_candidate_list || [];
    
    if (candidates.length > 0) {
      const best = candidates.reduce((min: any, c: any) => 
        c.fee_total < min.fee_total ? c : min
      , candidates[0]);
      
      const saving = fee_current - best.fee_total;
      const alpha = 0.3; // fee split parameter (0.10 ~ 0.75)
      const lumi_fee = saving > 0 ? Math.floor(saving * alpha) : 0;
      const user_gain = saving - lumi_fee;
      
      response.router_decision = {
        enabled: state.auto_route_enabled || false,
        considered: true,
        best_candidate: best,
        saving: Math.max(0, saving),
        user_gain: Math.max(0, user_gain),
        lumi_fee,
        can_auto_switch: false, // MVP は常に false
      };
    }
  }
  
  // diagnostics（オプション）
  if (options.include_diagnostics) {
    response.diagnostics = {
      effective_fee_rate_current: action.fee_effective || 0,
      effective_fee_rate_best: action.fee_effective || 0,
      risk_score_delta,
    };
  }
  
  return json(response, 200);
}

/**
 * POST /api/v1/goal/buffer
 * paket_bigzoon（床）計算 API
 */
async function handleGoalBuffer(req: Request, env: Env) {
  if (req.method !== "POST") return text("method not allowed", 405);
  
  const body = await readBody(req);
  if (!body) {
    return json({ error: "request body required" }, 400);
  }
  
  // パラメータの取得
  const fixed_must = body.fixed_must || 0;
  const living_min = body.living_min || 0;
  const buffer_multiplier = body.buffer_multiplier || 0;
  
  // 床の計算: paket_bigzoon = fixed_must + living_min + buffer
  const paket_bigzoon = fixed_must + living_min + buffer_multiplier;
  
  return json({
    paket_bigzoon,
    components: {
      fixed_must,
      living_min,
      buffer_multiplier,
    },
    formula: "paket_bigzoon = fixed_must + living_min + buffer_multiplier",
  }, 200);
}

/**
 * GET /api/v1/links/wise
 * Wise紹介リンクを返す
 */
async function handleWiseLink(req: Request, env: Env) {
  if (req.method !== "GET") return text("method not allowed", 405);
  
  const url = env.WISE_REFERRAL_URL || "https://wise.com/jp/invite/asd/luminabulige";
  
  if (!url) {
    return json({ error: "Wise referral URL not configured" }, 500);
  }
  
  return json({ url }, 200);
}
export default {
  async fetch(req: Request, env: Env) {
    const url = new URL(req.url);
    const p = normPath(url.pathname);
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
    
    // --- Core OS Policy APIs (COPAPI) ---
    if (p === "/core/home_state") {
      return handleHomeState(req, env);
    }
    if (p === "/os/reaction") {
      return handleReaction(req, env);
    }
    if (p === "/goal/buffer") {
      return handleGoalBuffer(req, env);
    }
    if (p === "/links/wise") {
      return handleWiseLink(req, env);
    }
    
    // --- Invite APIs ---
    if (p === "/invite/issue") {
      return handleInviteIssue(req, env);
    }
    if (p === "/invite/verify") {
      return handleInviteVerify(req, env);
    }
    return text("Not found", 404);
  },
};
