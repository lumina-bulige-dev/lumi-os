// app/api/decisions/approve/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";

const SCHEMA = "lumi.decision_manifest.v0.1";
const LUMI_DB_DRIVER = new Set(["prod", "stage"]);
const TARGETS = new Set(["app", "verify", "api", "info"]);
const REASONS = new Set(["OPS_UPDATE", "SECURITY_UPDATE", "INCIDENT_RESPONSE", "COPY_CHANGE", "OTHER"]);
const ROLLBACKS = new Set(["revert_to_previous", "pinned_previous_id"]);

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function nowIso() {
  return new Date().toISOString();
}

async function persistDecisionToDb(manifest: any, approver: string) {
  const db = await getDb();

  const approved_at = nowIso();
  const env = manifest.scope.environment;
  const targets: string[] = manifest.scope.targets;

  // 1) ledger insert
  await db.execute(
    `INSERT INTO decisions
      (decision_id, schema, issued_at, env, targets_json, manifest_json, approved_at, approver, jws)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      manifest.decision_id,
      manifest.schema,
      manifest.issued_at,
      env,
      JSON.stringify(targets),
      JSON.stringify(manifest),
      approved_at,
      approver,
      null,
    ]
  );

  // 2) latest pointer upsert per target
  for (const t of targets) {
    await db.execute(
      `INSERT INTO decision_latest (env, target, decision_id, updated_at)
       VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(env, target) DO UPDATE SET
         decision_id=excluded.decision_id,
         updated_at=datetime('now')`,
      [env, t, manifest.decision_id]
    );
  }

  return approved_at;
}

/**
 * Minimal validation (stub).
 * NOTE: This does NOT prove truthfulness; only shapes.
 */
function validateManifest(body: unknown): { ok: true; manifest: any } | { ok: false; message: string } {
  if (!isObject(body)) return { ok: false, message: "Body must be an object." };
  if ((body as any).schema !== SCHEMA) return { ok: false, message: "Invalid schema." };

  const decision_id = (body as any).decision_id;
  if (typeof decision_id !== "string" || !decision_id.startsWith("dec_"))
    return { ok: false, message: "Invalid decision_id." };

  if (typeof (body as any).issued_at !== "string") return { ok: false, message: "issued_at required." };

  if (!isObject((body as any).scope)) return { ok: false, message: "scope required." };
  const env = (body as any).scope.environment;
  if (typeof env !== "string" || !ENVS.has(env)) return { ok: false, message: "Invalid scope.environment." };

  const targets = (body as any).scope.targets;
  if (!Array.isArray(targets) || targets.length === 0) return { ok: false, message: "scope.targets required." };
  for (const t of targets) {
    if (typeof t !== "string" || !TARGETS.has(t)) return { ok: false, message: `Invalid target: ${String(t)}` };
  }

  if (!isObject((body as any).change)) return { ok: false, message: "change required." };
  if (!isObject((body as any).change.maintenance_mode))
    return { ok: false, message: "change.maintenance_mode required." };
  if (typeof (body as any).change.maintenance_mode.enabled !== "boolean")
    return { ok: false, message: "maintenance_mode.enabled must be boolean." };

  if (!isObject((body as any).reason)) return { ok: false, message: "reason required." };
  if (typeof (body as any).reason.code !== "string" || !REASONS.has((body as any).reason.code))
    return { ok: false, message: "Invalid reason.code." };
  if (typeof (body as any).reason.summary !== "string" || (body as any).reason.summary.trim().length < 3)
    return { ok: false, message: "reason.summary is too short." };

  if (!isObject((body as any).rollback)) return { ok: false, message: "rollback required." };
  if (typeof (body as any).rollback.strategy !== "string" || !ROLLBACKS.has((body as any).rollback.strategy))
    return { ok: false, message: "Invalid rollback.strategy." };
  if (typeof (body as any).rollback.safe_window_minutes !== "number")
    return { ok: false, message: "rollback.safe_window_minutes must be number." };

  if (!isObject((body as any).audit)) return { ok: false, message: "audit required." };
  if (typeof (body as any).audit.notes !== "string") return { ok: false, message: "audit.notes required." };

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

  try {
    const approved_at = await persistDecisionToDb(v.manifest, gate.approver);

    return NextResponse.json({
      ok: true,
      decision_id: v.manifest.decision_id,
      approved_at,
      approver: gate.approver,
    });
  } catch (e: any) {
    // DBが未配線/テーブル未作成などもここに落ちる
    return NextResponse.json(
      { ok: false, error: "DB_PERSIST_FAILED", message: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
