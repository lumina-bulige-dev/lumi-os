// app/v/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type VerifyResult = {
  ok: boolean;
  result: "OK" | "NG" | "REVOKED" | "UNKNOWN";
  verified?: boolean;
  proof?: any;
  kid?: string;
  alg?: string;
  payload_hash_b64u?: string;
  error?: string;
  message?: string;
};

export default function VerifyPage() {
  const sp = useSearchParams();
  const [res, setRes] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = new URLSearchParams();
    const proofId = sp.get("proofId");
    const hash = sp.get("hash");
    const sig = sp.get("sig");
    const kid = sp.get("kid");
    const alg = sp.get("alg");
    const ts = sp.get("ts");

    if (proofId) q.set("proofId", proofId);
    if (hash) q.set("hash", hash);
    if (sig) q.set("sig", sig);
    if (kid) q.set("kid", kid);
    if (alg) q.set("alg", alg);
    if (ts) q.set("ts", ts);

    fetch(`/api/verify?${q.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setRes(j))
      .finally(() => setLoading(false));
  }, [sp]);

  return (
    <main style={{ padding: 20, maxWidth: 720, margin: "0 auto" }}>
      <h1>Verification</h1>

      {loading && <p>Checking…</p>}

      {!loading && res && (
        <div style={{ border: "1px solid #ddd", padding: 16, borderRadius: 12 }}>
          <h2>
            Result:{" "}
            {res.result === "OK"
              ? "OK ✅"
              : res.result === "REVOKED"
              ? "REVOKED ⚠️"
              : res.result === "UNKNOWN"
              ? "UNKNOWN ❓"
              : "NG ❌"}
          </h2>

          <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 }}>
            <div>alg: {res.alg}</div>
            <div>kid: {res.kid}</div>
            <div>hash: {res.payload_hash_b64u}</div>
          </div>

          {res.proof && (
            <>
              <hr />
              <h3>Report Summary</h3>
              <div>Range: {res.proof.range.from} .. {res.proof.range.to}</div>
              <div>
                SAFE: {res.proof.counts.SAFE} / WARNING: {res.proof.counts.WARNING} / DANGER: {res.proof.counts.DANGER}
              </div>
              <div>Ruleset: {res.proof.ruleset_version}</div>
              <div>Status: {res.proof.status}</div>
            </>
          )}

          {(res.error || res.message) && (
            <>
              <hr />
              <div style={{ color: "#b00" }}>
                {res.error} {res.message}
              </div>
            </>
          )}

          <hr />
          <small>
            Note: This verification confirms integrity of the signed proof only. It is not a bank service, custody, or investment advice.
          </small>
        </div>
      )}
    </main>
  );
}
