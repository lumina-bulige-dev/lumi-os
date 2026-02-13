import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { proofKvKeys } from "@/app/lib/proofs/keys";
import { isProofReceipt, verifyReceipt, type VerificationFailureReason } from "@/app/lib/proofs/verify";

type ConsentReceipt = {
  v: number;
  type: "consent_presence";
  presence_only: true;
  importance: "low";
  subject_user_id: string;
  counterparty_hash: string;
  status: "ACTIVE" | "REVOKED";
  accepted_at: string;
  revoked_at: string | null;
  masked_phone: string;
  issued_at: string;
  ledger_log_id: string;
  payload_hash: string;
  kid: string;
  sig: string;
};

function invalidQuery() {
  return NextResponse.json({ error: "invalid_query" }, { status: 400 });
}

function receiptNotFound() {
  return NextResponse.json(
    {
      error: "receipt_not_found",
      verification: { result: "UNKNOWN", reason: "missing" },
    },
    { status: 404 }
  );
}

function invalidSignature(reason: VerificationFailureReason) {
  return NextResponse.json(
    {
      error: reason,
      verification: { result: "NG", reason },
    },
    { status: 422 }
  );
}

function isConsentReceipt(receipt: unknown): receipt is ConsentReceipt {
  return isProofReceipt(receipt) && receipt.type === "consent_presence";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const subjectUserId = searchParams.get("subject_user_id");
  const counterpartyHash = searchParams.get("counterparty_hash");
  if (!subjectUserId || !counterpartyHash) {
    return invalidQuery();
  }

  const { env } = getRequestContext();
  const kv = env.PROOFS as KVNamespace | undefined;
  if (!kv) {
    return NextResponse.json({ error: "proofs_binding_missing" }, { status: 500 });
  }

  const receiptKey = proofKvKeys.consent(subjectUserId, counterpartyHash);
  const receiptRaw = await kv.get(receiptKey, "text");
  if (!receiptRaw) {
    return receiptNotFound();
  }
  let receipt: ConsentReceipt;
  try {
    receipt = JSON.parse(receiptRaw);
  } catch {
    return invalidSignature("payload_hash_mismatch");
  }
  if (!isConsentReceipt(receipt)) {
    return invalidSignature("payload_hash_mismatch");
  }

  const jwks = env.PROOFS_JWKS as string | undefined;
  const verification = await verifyReceipt(receipt, jwks);
  if (!verification.ok) {
    return invalidSignature(verification.reason ?? "signature_invalid");
  }

  return NextResponse.json({
    presence_only: true,
    importance: "low",
    status: receipt.status,
    accepted_at: receipt.accepted_at,
    revoked_at: receipt.revoked_at,
    masked_phone: receipt.masked_phone,
    ledger_log_id: receipt.ledger_log_id,
    receipt: {
      payload_hash: receipt.payload_hash,
      kid: receipt.kid,
      sig: receipt.sig,
    },
    disclaimer: {
      no_guarantee: true,
      no_credit_claim: true,
    },
  });
}
