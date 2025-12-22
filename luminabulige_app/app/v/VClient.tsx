"use client";
import { ui } from "./ui";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type VerifyResult = "OK" | "NG" | "REVOKED" | "UNKNOWN";

type ProofSummary = {
  proof_id: string;
  created_at_ts: number;
  range: { from: string | null; to: string | null };
  counts: { SAFE: number; WARNING: number; DANGER: number; total: number };
  ruleset_version: string | null;
  payload_hash_b64u: string;
  kid: string;
  alg: string;
  sig_ts: number | null;
  status: string;
};

type VerifyResponse = {
  ok: boolean;
  result: VerifyResult | string;
  verified?: boolean;
  proof?: ProofSummary | null;
  error?: string;
  message?: string;
  kid?: string;
  alg?: string;
  payload_hash_b64u?: string;
};

function fmtDate(ts?: number | null) {
  if (!ts) return "-";
  try {
    return new Date(ts).toLocaleString("ja-JP");
  } catch {
    return String(ts);
  }
}

function criteriaLine(result: string) {
  switch (result) {
    case "OK":
      return "署名が一致しました";
    case "NG":
      return "署名が一致しませんでした";
    case "REVOKED":
      return "発行元が無効化しています";
    case "UNKNOWN":
      return "鍵情報が取得できませんでした";
    default:
      return "判定情報を取得できませんでした";
  }
}

function badgeStyle(result: string): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.3,
    border: "1px solid #E5E7EB",
    background: "#F9FAFB",
    color: "#111827",
  };

  if (result === "OK")
    return { ...base, background: "#ECFDF5", borderColor: "#A7F3D0", color: "#065F46" };
  if (result === "NG")
    return { ...base, background: "#FEF2F2", borderColor: "#FECACA", color: "#991B1B" };
  if (result === "REVOKED")
    return { ...base, background: "#FFF7ED", borderColor: "#FED7AA", color: "#9A3412" };
  if (result === "UNKNOWN")
    return { ...base, background: "#EFF6FF", borderColor: "#BFDBFE", color: "#1E40AF" };

  return base;
}

export default function VClient() {
  const sp = useSearchParams();

  const q = useMemo(() => {
    const proofId = sp.get("proofId") || "";
    const hash = sp.get("hash") || "";
    const sig = sp.get("sig") || "";
    const kid = sp.get("kid") || "";
    const alg = sp.get("alg") || "";
    const ts = sp.get("ts") || "";
    return { proofId, hash, sig, kid, alg, ts };
  }, [sp]);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<VerifyResponse | null>(null);
  const [err, setErr] = useState<string>("");

  const hasEnoughParams = useMemo(() => {
    // proofId があるならそれだけでOK（DB優先）
    if (q.proofId) return true;
    return !!(q.hash && q.sig && q.kid && q.alg);
  }, [q]);

  useEffect(() => {
    let alive = true;

    async function run() {
      setLoading(true);
      setErr("");
      setData(null);

      if (!hasEnoughParams) {
        setLoading(false);
        setErr("missing_params");
        return;
      }

      try {
        const params = new URLSearchParams();
        if (q.proofId) params.set("proofId", q.proofId);
        if (!q.proofId) {
          params.set("hash", q.hash);
          params.set("sig", q.sig);
          params.set("kid", q.kid);
          params.set("alg", q.alg);
          if (q.ts) params.set("ts", q.ts);
        }

        const res = await fetch(`/api/verify?${params.toString()}`, { cache: "no-store" });
        const json = (await res.json()) as VerifyResponse;

        if (!alive) return;
        setData(json);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || String(e));
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [q, hasEnoughParams]);

  const result = (data?.result || (err ? "NG" : "UNKNOWN")) as string;
  const showContact = result === "NG" || result === "UNKNOWN";

  const mailto = useMemo(() => {
    const subject = "Proof Verification Issue";
    const bodyLines = [
      "Proof Verification Issue",
      "",
      `time: ${new Date().toISOString()}`,
      `url: ${typeof window !== "undefined" ? window.location.href : ""}`,
      "",
      `result: ${result}`,
      `error: ${data?.error || err || ""}`,
      "",
      `proofId: ${q.proofId || ""}`,
      `hash: ${q.hash || data?.payload_hash_b64u || ""}`,
      `kid: ${q.kid || data?.kid || ""}`,
      `alg: ${q.alg || data?.alg || ""}`,
      "",
      "response:",
      JSON.stringify(data ?? {}, null, 2),
      "",
    ];
    const body = bodyLines.join("\n");
    return `mailto:contact@luminabulige.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [q, result, data, err]);

  const proof = data?.proof || null;
  const hasProof = !!proof;

  return (
   <section style={{
  maxWidth: 760,
  margin: `${ui.space.xl}px auto`,
  padding: ui.space.lg,
  borderRadius: ui.radius.lg,
  border: `1px solid ${ui.color.border}`,
  background: ui.color.card,
  boxShadow: ui.shadow.card,
}}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>Proof Verification</div>
          <div style={{ marginTop: 6, fontSize: 12, color: "#6B7280" }}>LUMINA BULIGE / Verify</div>
        </div>
        <div style={badgeStyle(result)}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: "currentColor", opacity: 0.6 }} />
          {loading ? "CHECKING" : result}
        </div>
      </div>

      <div style={{ marginTop: 14, padding: 12, borderRadius: 14, background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{criteriaLine(result)}</div>

        {/* 説明文：verified=false かつ proofId が存在する */}
        {!loading && data && data.ok && data.verified === false && !!q.proofId && (
          <div style={{ marginTop: 6, fontSize: 12, color: "#6B7280" }}>
            proofId は存在しますが署名不一致です（改ざん、または不一致の可能性）。
          </div>
        )}

        {!loading && err && (
          <div style={{ marginTop: 6, fontSize: 12, color: "#991B1B" }}>
            error: {err}
          </div>
        )}
        {!loading && data?.error && (
          <div style={{ marginTop: 6, fontSize: 12, color: "#6B7280" }}>
            detail: {data.error}{data.message ? ` (${data.message})` : ""}
          </div>
        )}
      </div>

      {/* Contact button */}
      {showContact && !loading && (
        <div style={{ marginTop: 14 }}>
          <a
            href={mailto}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #111827",
              background: "#111827",
              color: "#FFFFFF",
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            発行元に問い合わせ
          </a>
          <div style={{ marginTop: 8, fontSize: 12, color: "#6B7280" }}>
            NG/UNKNOWN の場合は、発行元で状況確認してください。
          </div>
        </div>
      )}

      {/* Proof card */}
      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>Proof</div>

        {!hasProof && !loading && (
          <div style={{ marginTop: 10, fontSize: 12, color: "#6B7280" }}>
            proof 情報は取得できませんでした（proofId 未指定、またはDB未登録の可能性）。
          </div>
        )}

        {hasProof && (
          <div
            style={{
              marginTop: 10,
              padding: 14,
              borderRadius: 14,
              border: "1px solid #E5E7EB",
              background: "#FFFFFF",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", rowGap: 8, columnGap: 12 }}>
              <div style={{ fontSize: 12, color: "#6B7280" }}>proof_id</div>
              <div style={{ fontSize: 12, color: "#111827", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                {proof!.proof_id}
              </div>

              <div style={{ fontSize: 12, color: "#6B7280" }}>created</div>
              <div style={{ fontSize: 12, color: "#111827" }}>{fmtDate(proof!.created_at_ts)}</div>

              <div style={{ fontSize: 12, color: "#6B7280" }}>range</div>
              <div style={{ fontSize: 12, color: "#111827" }}>
                {proof!.range?.from || "-"} 〜 {proof!.range?.to || "-"}
              </div>

              <div style={{ fontSize: 12, color: "#6B7280" }}>counts</div>
              <div style={{ fontSize: 12, color: "#111827" }}>
                SAFE {proof!.counts.SAFE} / WARNING {proof!.counts.WARNING} / DANGER {proof!.counts.DANGER} / total{" "}
                {proof!.counts.total}
              </div>

              <div style={{ fontSize: 12, color: "#6B7280" }}>ruleset_version</div>
              <div style={{ fontSize: 12, color: "#111827" }}>{proof!.ruleset_version || "-"}</div>

              <div style={{ fontSize: 12, color: "#6B7280" }}>kid / alg</div>
              <div style={{ fontSize: 12, color: "#111827" }}>
                {proof!.kid} / {proof!.alg}
              </div>

              <div style={{ fontSize: 12, color: "#6B7280" }}>status</div>
              <div style={{ fontSize: 12, color: "#111827" }}>{proof!.status}</div>
            </div>

            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: "pointer", fontSize: 12, color: "#1F2937", fontWeight: 700 }}>raw</summary>
              <pre
                style={{
                  marginTop: 10,
                  padding: 12,
                  borderRadius: 12,
                  background: "#0B1020",
                  color: "#E5E7EB",
                  overflow: "auto",
                  fontSize: 11,
                }}
              >
                {JSON.stringify(proof, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>

      {/* Params / Debug */}
      <details style={{ marginTop: 18 }}>
        <summary style={{ cursor: "pointer", fontSize: 12, color: "#6B7280", fontWeight: 700 }}>debug</summary>
        <pre
          style={{
            marginTop: 10,
            padding: 12,
            borderRadius: 12,
            background: "#F3F4F6",
            color: "#111827",
            overflow: "auto",
            fontSize: 11,
          }}
        >
          {JSON.stringify({ query: q, response: data, err }, null, 2)}
        </pre>
      </details>
    </section>
  );
}
