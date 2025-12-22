// app/v/VClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type VerifyResult = "OK" | "NG" | "REVOKED" | "UNKNOWN";
type VerifyResp = {
  ok: boolean;
  result: VerifyResult;
  verified?: boolean;
  error?: string;
  message?: string;
  proof?: any;
  kid?: string;
  alg?: string;
  payload_hash_b64u?: string;
};

function pick(sp: URLSearchParams, key: string) {
  const v = sp.get(key);
  return v && v.length > 0 ? v : undefined;
}

export default function VClient() {
  const sp = useSearchParams();

  const params = useMemo(() => {
    // C運用：proofId + フルパラメータを全部許可
    return {
      proofId: pick(sp, "proofId"),
      hash: pick(sp, "hash"),
      sig: pick(sp, "sig"),
      kid: pick(sp, "kid"),
      alg: pick(sp, "alg"),
      ts: pick(sp, "ts"),
    };
  }, [sp]);

  const [loading, setLoading] = useState(true);
  const [resp, setResp] = useState<VerifyResp | null>(null);

  const query = useMemo(() => {
    const q = new URLSearchParams();
    if (params.proofId) q.set("proofId", params.proofId);
    if (params.hash) q.set("hash", params.hash);
    if (params.sig) q.set("sig", params.sig);
    if (params.kid) q.set("kid", params.kid);
    if (params.alg) q.set("alg", params.alg);
    if (params.ts) q.set("ts", params.ts);
    // method=qr を付けたい場合は verify.ts 側で input.method を見てるのでここでもOK
    q.set("method", "qr");
    return q.toString();
  }, [params]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setResp(null);

      try {
        const r = await fetch(`/api/verify?${query}`, { cache: "no-store" });
        const j = (await r.json()) as VerifyResp;
        if (!cancelled) setResp(j);
      } catch (e: any) {
        if (!cancelled)
          setResp({ ok: false, result: "NG", error: "fetch_failed", message: e?.message || String(e) });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    // C運用の最低条件：proofId か（hash+sig+kid+alg）のどちらか
    const hasProofId = !!params.proofId;
    const hasFull = !!(params.hash && params.sig && params.kid && params.alg);
    if (hasProofId || hasFull) run();
    else {
      setLoading(false);
      setResp({
        ok: false,
        result: "NG",
        error: "missing_params",
        message: "need proofId OR (hash,sig,kid,alg)",
      });
    }

    return () => {
      cancelled = true;
    };
  }, [query, params.proofId, params.hash, params.sig, params.kid, params.alg]);

  const badge =
    resp?.result === "OK"
      ? "✅ OK"
      : resp?.result === "REVOKED"
      ? "⛔ REVOKED"
      : resp?.result === "UNKNOWN"
      ? "❓ UNKNOWN"
      : resp?.result === "NG"
      ? "❌ NG"
      : "";

  return (
    <div style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1 style={{ margin: 0 }}>Verify</h1>
      <div style={{ opacity: 0.7, marginTop: 6 }}>
        proofId: {params.proofId ?? "-"} / kid: {params.kid ?? "-"} / alg: {params.alg ?? "-"}
      </div>

      {loading && <div style={{ marginTop: 16 }}>Verifying...</div>}

      {!loading && resp && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{badge}</div>

          {resp.message && <div style={{ marginTop: 8, color: "#a00" }}>{resp.message}</div>}
          {resp.error && <div style={{ marginTop: 8, opacity: 0.7 }}>error: {resp.error}</div>}

          <pre style={{ marginTop: 16, padding: 12, background: "#111", color: "#eee", overflow: "auto" }}>
            {JSON.stringify(resp, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
