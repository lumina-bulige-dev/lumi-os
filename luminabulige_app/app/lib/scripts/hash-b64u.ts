// scripts/hash-b64u.ts
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

function b64u(buf: Buffer) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/,"");
}
// ここで canonicalize(JSON) を適用できるならする（RFC8785等）
const raw = readFileSync("artifacts/proof.release.json");
const digest = createHash("sha256").update(raw).digest();
process.stdout.write(b64u(digest));
