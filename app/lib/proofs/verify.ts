type ProofReceipt = Record<string, unknown> & {
  v: number;
  type: string;
  issued_at: string;
  ledger_log_id: string;
  payload_hash: string;
  kid: string;
  sig: string;
};

export type VerificationFailureReason = "missing" | "expired" | "signature_invalid" | "payload_hash_mismatch";

type VerificationResult = {
  ok: boolean;
  reason?: VerificationFailureReason;
};

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

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => sortObject(entry));
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return Object.keys(obj)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortObject(obj[key]);
        return acc;
      }, {});
  }
  return value;
}

function canonicalJson(value: unknown) {
  return JSON.stringify(sortObject(value));
}

async function sha256Hex(value: string) {
  const data = textEncoder.encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(hashBuffer);
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i++) {
    parts.push(bytes[i].toString(16).padStart(2, "0"));
  }
  return parts.join("");
}

function stripSigFields(receipt: ProofReceipt) {
  const { sig: _sig, payload_hash: _payloadHash, ...rest } = receipt;
  return rest;
}

function parseJws(jws: string) {
  const parts = jws.split(".");
  if (parts.length !== 3) {
    return null;
  }
  const [headerB64, payloadB64, signatureB64] = parts;
  try {
    const headerJson = new TextDecoder().decode(base64UrlDecode(headerB64));
    const header = JSON.parse(headerJson) as { alg?: string; kid?: string };
    const payload = new TextDecoder().decode(base64UrlDecode(payloadB64));
    const signature = base64UrlDecode(signatureB64);
    return { header, payload, signature, signingInput: `${headerB64}.${payloadB64}` };
  } catch {
    return null;
  }
}

async function loadJwkForKid(kid: string, jwksJson: string | undefined) {
  if (!jwksJson) return null;
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
}

async function verifyJwsEd25519(jws: string, kid: string, jwksJson: string | undefined) {
  const parsed = parseJws(jws);
  if (!parsed) return { ok: false };
  if (parsed.header.alg !== "EdDSA" || parsed.header.kid !== kid) {
    return { ok: false };
  }
  const key = await loadJwkForKid(kid, jwksJson);
  if (!key) return { ok: false };
  const data = textEncoder.encode(parsed.signingInput);
  const ok = await crypto.subtle.verify({ name: "Ed25519" }, key, parsed.signature, data);
  return { ok, payload: parsed.payload };
}

export async function verifyReceipt(
  receipt: ProofReceipt,
  jwksJson: string | undefined
): Promise<VerificationResult> {
  const canonical = canonicalJson(stripSigFields(receipt));
  const payloadHash = await sha256Hex(canonical);
  const acceptedHashes = new Set([payloadHash, `ph_${payloadHash}`, `sha256:${payloadHash}`]);
  if (!acceptedHashes.has(receipt.payload_hash)) {
    return { ok: false, reason: "payload_hash_mismatch" };
  }
  const jwsResult = await verifyJwsEd25519(receipt.sig, receipt.kid, jwksJson);
  if (!jwsResult.ok) {
    return { ok: false, reason: "signature_invalid" };
  }
  if (jwsResult.payload !== receipt.payload_hash) {
    return { ok: false, reason: "payload_hash_mismatch" };
  }
  return { ok: true };
}

export function isProofReceipt(value: unknown): value is ProofReceipt {
  if (!value || typeof value !== "object") return false;
  const receipt = value as ProofReceipt;
  return (
    typeof receipt.v === "number" &&
    typeof receipt.type === "string" &&
    typeof receipt.issued_at === "string" &&
    typeof receipt.ledger_log_id === "string" &&
    typeof receipt.payload_hash === "string" &&
    typeof receipt.kid === "string" &&
    typeof receipt.sig === "string"
  );
}
