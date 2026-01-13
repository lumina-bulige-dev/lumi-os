export interface Env { /* ... */ }

// --- router helpers ---
function normPath(...) { ... }

// --- http helpers ---
function corsPreflight(req: Request) { ... }
function json(...) { ... }
function text(...) { ... }
async function readBody(...) { ... }

// --- auth ---
function hasAdmin(...) { ... }

// --- crypto helpers (base64url/hmac) ---
function toBase64Url(...) { ... }
function fromBase64Url(...) { ... }
function timingSafeEqual(...) { ... }
async function hmacSha256(...) { ... }

// --- invite ---
async function signInviteToken(...) { ... }
async function verifyInviteToken(...) { ... }

// --- handlers ---
async function handleDebug(...) { ... }
async function handleInviteIssue(...) { ... }
async function handleInviteVerify(...) { ... }

// --- entry ---
export default {
  async fetch(req: Request, env: Env) {
    if (req.method === "OPTIONS") return corsPreflight(req);

    const url = new URL(req.url);
    const p = normPath(url.pathname);

    // routes...
  },
};
