"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type VerifyResult = "OK" | "NG" | "REVOKED" | "UNKNOWN";

type ProofSummary = {
  proof_id: string;
  created_at_ts: number;
  range: { from: string; to: string };
  counts: { SAFE: number; WARNING: number; DANGER: number; total: number };
  ruleset_version: string;
  payload_hash_b64u: string;
  kid: string;
  alg: string;
  sig_ts?: number;
  status?: string;
};

type VerifyResponse = {
  ok: boolean;
  result: VerifyResult;
  verified?: boolean;
  proof?: ProofSummary | null;
  kid?: string;
  alg?: string;
  payload_hash_b64u?: string;
  error?: string;
  message?: string;
};

function fmtJst(ts?: number) {
  if (!ts) return "-";
  return new Date(ts).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
}

function badgeStyle(result: VerifyResult): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    border: "1px solid #E5E7EB",
    background: "#FFFFFF",
  };

  if (result === "OK") return { ...base, borderColor: "#A7F3D0", color: "#065F46", background: "#ECFDF5" };
  if (result === "REVOKED") return { ...base, borderColor: "#FCD34D", color: "#7C2D12", background: "#FFFBEB" };
  if (result === "UNKNOWN") return { ...base, borderColor: "#C7D2FE", color: "#3730A3", background: "#EEF2FF" };
  return { ...base, borderColor: "#FCA5A5", color: "#7F1D1D", background: "#FEF2F2" }; // NG
}

function headline(result: VerifyResult) {
  if (result === "OK") return "検証OK（署名一致）";
  if (result === "REVOKED") return "失効（発行元が無効化）";
  if (result === "UNKNOWN") return "不明（鍵情報が見つからない等）";
  return "検証NG（署名不一致）";
}

function explanation(result: VerifyResult, hasProofId: boolean, hasProof: boolean) {
  if (result === "OK") return "この証明は改ざんされていません。";
  if (result === "REVOKED") return "この証明は発行元により失効済みです。現在は有効ではありません。";
  if (result === "UNKNOWN")
    return "公開鍵（kid）が見つからないため検証できません。発行元側の鍵公開設定（keys/JWKS）をご確認ください。";

  // NG
  if (hasProofId && hasProof) {
    return [
      "この証明（proofId）は発行されていますが、提示された hash/sig が一致しません。",
      "可能性：①URL/QRが改ざんされた ②別の証明の値と取り違えた ③鍵（kid）の不整合",
      "対応：発行元から正しいQR/URLを再取得してください。",
    ].join("\n");
  }
  return "署名が一致しません。URL（hash/sig/kid/alg）が正しいか確認してください。";
}

function chipStyle(): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid #E5E7EB",
    background: "#FFFFFF",
    fontSize: 12,
    fontWeight: 700,
  };
}

function btnStyle(kind: "primary" | "ghost" = "ghost"): React.CSSProperties {
  const base: React.CSSProperties = {
    borderRadius: 10,
    padding: "10px 12px",
    fontWeight: 800,
    fontSize: 13,
    cursor: "pointer",
  };
  if (kind === "primary") return { ...base, border: "1px solid #111827", background: "#111827", color: "#FFFFFF" };
  return { ...base, border: "1px solid #E5E7EB", background: "#FFFFFF", color: "#111827" };
}

async function fetchVerify(params: { proofId?: string; hash?: string; sig?: string; kid?: string; alg?: string }) {
  const qs = new URLSearchParams();
  if (params.proofId) qs.set("proofId", params.proofId);
  if (params.hash) qs.set("hash", params.hash);
  if (params.sig) qs.set("sig", params.sig);
  if (params.kid) qs.set("kid", params.kid);
  if (params.alg) qs.set("alg", params.alg);

  const res = await fetch(`/api/verify?${qs.toString()}`, { cache: "no-store" });
  const json = (await res.json()) as VerifyResponse;
  return { status: res.status, json };
}

export default function VClient() {
  const sp = useSearchParams();

  const params = useMemo(() => {
    const proofId = sp.get("proofId") || undefined;
    const hash = sp.get("hash") || undefined;
    const sig = sp.get("sig") || undefined;
    const kid = sp.get("kid") || undefined;
    const alg = sp.get("alg") || undefined;
    return { proofId, hash, sig, kid, alg };
  }, [sp]);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<VerifyResponse | null>(null);
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const run = async () => {
    try {
      setLoading(true);
      setErr(null);
      const r = await fetchVerify(params);
      setHttpStatus(r.status);
      setData(r.json);
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.proofId, params.hash, params.sig, params.kid, params.alg]);

  const hasProofId = !!params.proofId;

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // fallback
      prompt("コピーしてください", window.location.href);
    }
  };

  if (loading) return <div>検証中…</div>;
  if (err) return <div style={{ whiteSpace: "pre-wrap" }}>エラー: {err}</div>;
  if (!data) return <div>データなし</div>;

  const result = data.result;
  const hasProof = !!data.proof;

  return (
    <section style={{ border: "1px solid #E5E7EB", borderRadius: 18, padding: 18, background: "#FFFFFF" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={badgeStyle(result)}>
            <span>{result}</span>
            {httpStatus ? <span style={{ fontWeight: 700, opacity: 0.7 }}>HTTP {httpStatus}</span> : null}
          </div>
          <div style={{ marginTop: 10, fontSize: 18, fontWeight: 900 }}>{headline(result)}</div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button style={btnStyle()} onClick={copyUrl}>URLをコピー</button>
          <button style={btnStyle("primary")} onClick={run}>再検証</button>
        </div>
      </div>

      {/* Explanation */}
      <div style={{ marginTop: 14, whiteSpace: "pre-wrap", color: "#374151", lineHeight: 1.65 }}>
        {explanation(result, hasProofId, hasProof)}
      </div>

      {/* Proof summary */}
      {data.proof && (
        <div style={{ marginTop: 16, borderTop: "1px solid #F3F4F6", paddingTop: 14 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>証明サマリ</div>

          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", rowGap: 10, columnGap: 14 }}>
            <div style={{ color: "#6B7280", fontWeight: 800 }}>発行日時（JST）</div>
            <div style={{ fontWeight: 800 }}>{fmtJst(data.proof.created_at_ts)}</div>

            <div style={{ color: "#6B7280", fontWeight: 800 }}>対象期間</div>
            <div style={{ fontWeight: 800 }}>
              {data.proof.range?.from} 〜 {data.proof.range?.to}
            </div>

            <div style={{ color: "#6B7280", fontWeight: 800 }}>カウント</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <span style={chipStyle()}>SAFE {data.proof.counts?.SAFE}</span>
              <span style={chipStyle()}>WARNING {data.proof.counts?.WARNING}</span>
              <span style={chipStyle()}>DANGER {data.proof.counts?.DANGER}</span>
              <span style={chipStyle()}>total {data.proof.counts?.total}</span>
            </div>

            <div style={{ color: "#6B7280", fontWeight: 800 }}>ruleset</div>
            <div style={{ fontWeight: 800 }}>{data.proof.ruleset_version}</div>
          </div>
        </div>
      )}

      {/* Details */}
      <details style={{ marginTop: 14 }}>
        <summary style={{ cursor: "pointer", fontWeight: 900 }}>技術詳細</summary>
        <pre style={{ background: "#F9FAFB", padding: 12, borderRadius: 12, overflowX: "auto", marginTop: 10 }}>
{JSON.stringify(
  {
    proof_id: data.proof?.proof_id ?? null,
    payload_hash_b64u: data.payload_hash_b64u ?? data.proof?.payload_hash_b64u ?? null,
    kid: data.kid ?? data.proof?.kid ?? null,
    alg: data.alg ?? data.proof?.alg ?? null,
    verified: data.verified ?? null,
    error: data.error ?? null,
    message: data.message ?? null,
  },
  null,
  2
)}
        </pre>
      </details>
    </section>
  );
}
