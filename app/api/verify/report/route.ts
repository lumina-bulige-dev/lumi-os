import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { proofKvKeys } from "@/app/lib/proofs/keys";
import { isProofReceipt, verifyReceipt } from "@/app/lib/proofs/verify";

type ShareReceipt = {
  type: "share";
  token: string;
  report_id: string;
  scope: string;
  expires_at: string;
  issued_at: string;
  ledger_log_id: string;
  payload_hash: string;
  kid: string;
  sig: string;
};

type ReportReceipt = {
  type: "report";
  report_id: string;
  doc_fingerprint: string;
  issuer: string;
  issued_at: string;
  ledger_log_id: string;
  payload_hash: string;
  kid: string;
  sig: string;
};

function invalidQuery() {
  return NextResponse.json({ error: "invalid_query" }, { status: 400 });
}

function receiptNotFound(reason: "missing") {
  return NextResponse.json(
    {
      error: "receipt_not_found",
      verification: { result: "UNKNOWN", reason },
    },
    { status: 404 }
  );
}

function tokenExpired() {
  return NextResponse.json(
    {
      error: "token_expired",
      verification: { result: "UNKNOWN", reason: "expired" },
    },
    { status: 410 }
  );
}

function invalidSignature(reason: "signature_invalid" | "payload_hash_mismatch") {
  return NextResponse.json(
    {
      error: reason,
      verification: { result: "NG", reason },
    },
    { status: 422 }
  );
}

function isShareReceipt(receipt: unknown): receipt is ShareReceipt {
  return isProofReceipt(receipt) && receipt.type === "share";
}

function isReportReceipt(receipt: unknown): receipt is ReportReceipt {
  return isProofReceipt(receipt) && receipt.type === "report";
}

function hasString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) {
    return invalidQuery();
  }

  const { env } = getRequestContext();
  const kv = env.PROOFS as KVNamespace | undefined;
  if (!kv) {
    return NextResponse.json({ error: "proofs_binding_missing" }, { status: 500 });
  }

  const shareKey = proofKvKeys.share(token);
  const shareRaw = await kv.get(shareKey, "text");
  if (!shareRaw) {
    return receiptNotFound("missing");
  }
  let shareReceipt: ShareReceipt;
  try {
    shareReceipt = JSON.parse(shareRaw);
  } catch {
    return invalidSignature("payload_hash_mismatch");
  }
  if (!isShareReceipt(shareReceipt)) {
    return invalidSignature("payload_hash_mismatch");
  }
  if (!hasString(shareReceipt.report_id) || !hasString(shareReceipt.expires_at)) {
    return invalidSignature("payload_hash_mismatch");
  }
  const expiresAt = Date.parse(shareReceipt.expires_at);
  if (Number.isNaN(expiresAt)) {
    return invalidSignature("payload_hash_mismatch");
  }
  if (Date.now() > expiresAt) {
    return tokenExpired();
  }

  const jwks = env.PROOFS_JWKS as string | undefined;
  const shareVerification = await verifyReceipt(shareReceipt, jwks);
  if (!shareVerification.ok) {
    return invalidSignature(shareVerification.reason ?? "signature_invalid");
  }

  const reportKey = proofKvKeys.report(shareReceipt.report_id);
  const reportRaw = await kv.get(reportKey, "text");
  if (!reportRaw) {
    return receiptNotFound("missing");
  }
  let reportReceipt: ReportReceipt;
  try {
    reportReceipt = JSON.parse(reportRaw);
  } catch {
    return invalidSignature("payload_hash_mismatch");
  }
  if (!isReportReceipt(reportReceipt)) {
    return invalidSignature("payload_hash_mismatch");
  }

  const reportVerification = await verifyReceipt(reportReceipt, jwks);
  if (!reportVerification.ok) {
    return invalidSignature(reportVerification.reason ?? "signature_invalid");
  }

  return NextResponse.json({
    verification: { result: "OK", reason: "signature_ok" },
    report: {
      report_id: reportReceipt.report_id,
      doc_fingerprint: reportReceipt.doc_fingerprint,
      issuer: reportReceipt.issuer,
      issued_at: reportReceipt.issued_at,
      ledger_log_id: reportReceipt.ledger_log_id,
    },
    disclaimer: {
      proof_only: true,
      no_truth_claim: true,
      no_credit_claim: true,
    },
  });
}
