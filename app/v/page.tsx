// app/v/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import VClient from "./VClient"; // または import { VClient } from "./VClient";

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <VClient />
    </Suspense>
  );
}

export default function VerifyPage() {
  const sp = useSearchParams();
  const proofId = useMemo(() => sp.get("proofId") || "", [sp]);

  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function runVerify() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (!proofId) throw new Error("proofId が空です");

      // ✅ ここは後で「あなたの verify API」に合わせて差し替える
      // 例: /api/verify?proofId=...
      const res = await fetch(`/api/verify?proofId=${encodeURIComponent(proofId)}`, {
        method: "GET",
        headers: { accept: "application/json" },
      });

      const text = await res.text();
      let json: any = null;
      try { json = JSON.parse(text); } catch {}

      if (!res.ok) {
        throw new Error(json?.error || `HTTP ${res.status}: ${text.slice(0, 140)}`);
      }
      setResult(json);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontWeight: 900, fontSize: 22 }}>Verify</h1>

      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 12, opacity: 0.7 }}>proofId</div>
        <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas", wordBreak: "break-all" }}>
          {proofId || "(none)"}
        </div>
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
        <button onClick={runVerify} disabled={loading || !proofId}>
          {loading ? "Verifying..." : "検証する"}
        </button>
      </div>

      {error && (
        <pre style={{ marginTop: 16, padding: 12, background: "#fee", border: "1px solid #f99", whiteSpace: "pre-wrap" }}>
          {error}
        </pre>
      )}

      {result && (
        <pre style={{ marginTop: 16, padding: 12, background: "#eef", border: "1px solid #99f", whiteSpace: "pre-wrap" }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}
