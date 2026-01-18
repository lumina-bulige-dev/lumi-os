import canonicalize from "canonicalize";
import { sha256 } from "@noble/hashes/sha256";
import * as ed from "@noble/ed25519";

function b64url(bytes: Uint8Array) {
  return Buffer.from(bytes).toString("base64")
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function signDecisionManifest(manifest: any, kid: string, privKey: Uint8Array) {
  const normalized = canonicalize(manifest);              // RFC8785
  const hash = sha256(new TextEncoder().encode(normalized));
  const sig = await ed.sign(hash, privKey);

  const header = { alg: "EdDSA", kid, typ: "LUMI-DECISION" };
  const encodedHeader = b64url(new TextEncoder().encode(JSON.stringify(header)));
  const encodedPayload = b64url(new TextEncoder().encode(normalized));
  const encodedSig = b64url(sig);

  return `${encodedHeader}.${encodedPayload}.${encodedSig}`;
}
