// app/api/decisions/approve/route.ts
import { NextResponse } from "next/server";

const SCHEMA = "lumi.decision_manifest.v0.1";
const ENVS = new Set(["prod", "stage"]);
const TARGETS = new Set(["app", "verify", "api", "info"]);
const REASONS = new Set(["OPS_UPDATE", "SECURITY_UPDATE", "INCIDENT_RESPONSE", "COPY_CHANGE", "OTHER"]);
const ROLLBACKS = new Set(["revert_to_previous", "pinned_previous_id"]);

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

/**
 * Minimal validation (stub).
 * NOTE: This does NOT prove truthfulness; only shapes.
 */
function validateManifest(body: unknown): { ok: true; manifest: any } | { ok: false; message: string } {
  if (!isObject(body)) return { ok: false, message: "Body must be an object." };
  if (body.schema !== SCHEMA) return { ok: false, message: "Invalid schema." };
  if (typeof body.decision_id !== "string" || !body.decision_id.startsWith("dec_"))
    return { ok: false, message: "Invalid decision_id." };
  if (typeof body.issued_at !== "string") return { ok: false, message: "issued_at required." };

  if (!isObject(body.scope)) return { ok: false, message: "scope required." };
  const env = body.scope.environment;
  if (typeof env !== "string" || !ENVS.has(env)) return { ok: false, message: "Invalid scope.environment." };

  const targets = body.scope.targets;
  if (!Array.isArray(targets) || targets.length === 0) return { ok: false, message: "scope.targets required." };
  for (const t of targets) {
    if (typeof t !== "string" || !TARGETS.has(t)) return { ok: false, message: `Invalid target: ${String(t)}` };
  }

  if (!isObject(body.change)) return { ok: false, message: "change required." };
  if (!isObject(body.change.maintenance_mode)) return { ok: false, message: "change.maintenance_mode required." };
  if (typeof body.change.maintenance_mode.enabled !== "boolean")
    return { ok: false, message: "maintenance_mode.enabled must be boolean." };

  if (!isObject(body.reason)) return { ok: false, message: "reason required." };
  if (typeof body.reason.code !== "string" || !REASONS.has(body.reason.code))
    return { ok: false, message: "Invalid reason.code." };
  if (typeof body.reason.summary !== "string" || body.reason.summary.trim().length < 3)
    return { ok: false, message: "reason.summary is too short." };

  if (!isObject(body.rollback)) return { ok: false, message: "rollback required." };
  if (typeof body.rollback.strategy !== "string" || !ROLLBACKS.has(body.rollback.strategy))
    return { ok: false, message: "Invalid rollback.strategy." };
  if (typeof body.rollback.safe_window_minutes !== "number")
    return { ok: false, message: "rollback.safe_window_minutes must be number." };

  if (!isObject(body.audit)) return { ok: false, message: "audit required." };
  if (typeof body.audit.notes !== "string") return { ok: false, message: "audit.notes required." };

  return { ok: true, manifest: body };
}

/**
 * Human-only gate (stub)
 * - Later: replace with Cloudflare Access / OAuth / RBAC / MFA.
 * - For now: require a header to prevent accidental programmatic calls.
 */
function requireHumanGate(req: Request): { ok: true; approver: string } | { ok: false; message: string } {
  const approver = req.headers.get("x-lumina-approver") || "";
  const otp = req.headers.get("x-lumina-otp") || "";
  if (!approver) return { ok: false, message: "Missing x-lumina-approver." };
  if (!otp || otp.length < 6) return { ok: false, message: "Missing/invalid x-lumina-otp." };
  return { ok: true, approver };
}

export async function POST(req: Request) {
  const gate = requireHumanGate(req);
  if (!gate.ok) {
    return NextResponse.json({ ok: false, error: "HUMAN_GATE", message: gate.message }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "BAD_JSON" }, { status: 400 });
  }

  const v = validateManifest(body);
  if (!v.ok) {
    return NextResponse.json({ ok: false, error: "INVALID_MANIFEST", message: v.message }, { status: 400 });
  }

  // TODO (next phase):
  // - canonicalize (RFC8785)
  // - sign (JWS EdDSA/Ed25519)
  // - persist (KV/DB)
  // - update "latest" pointer per target/env
  // - emit audit log (non-PII)

  const approved_at = new Date().toISOString();

  return NextResponse.json({
    ok: true,
    decision_id: v.manifest.decision_id,
    approved_at,
    approver: gate.approver,
    note: "stub: not signed, not persisted"
  });
}
