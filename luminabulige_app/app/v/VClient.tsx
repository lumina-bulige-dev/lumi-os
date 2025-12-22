"use client";

import React, { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ui } from "./ui";

type Result = "OK" | "NG" | "REVOKED" | "UNKNOWN";

type ProofSummary = {
  proof_id?: string;
  created_at_ts?: number | string;
  range?: { from?: string | number | null; to?: string | number | null };
  counts?: { SAFE?: number; WARNING?: number; DANGER?: number; total?: number };
  ruleset_version?: string;
  payload_hash_b64u?: string;
  kid?: string;
  alg?: string;
  sig_ts?: number | string;
  status?: string;
};

type VerifyResponse = {
  ok: boolean;
  result: Result | string;
  verified?: boolean;
  proof?: ProofSummary | null;
  kid?: string;
  alg?: string;
  payload_hash_b64u?: string;
  error?: string;
  message?: string;
  need?: string[];
  got?: any;
};

const CRITERIA: Record<Result, string> = {
  OK: "署名が一致しました",
  NG: "署名が一致しませんでした",
  REVOKED: "発行元が無効化しています",
  UNKNOWN: "鍵情報が取得できませんでした",
};

function badgeStyle(result: Result) {
  switch (result) {
    case "OK":
      return { color: ui.color.ok, background: ui.color.okBg, border: `1px solid #A7F3D0` };
    case "NG":
      return { color: ui.color.ng, background: ui.color.ngBg, border: `1px solid #FED7AA` };
    case "REVOKED":
      return { color: ui.color.rev, background: ui.color.revBg, border: `1px solid #FECACA` };
    case "UNKNOWN":
      return { color: ui.color.unk, background: ui.color.unkBg, border: `1px solid ${ui.color.border}` };
  }
}

function shortHash(s?: string | null, head = 10, tail = 6) {
  if (!s) return "";
  if (s.length <= head + tail + 3) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}

function toDateMaybe(x: any): Date | null {
  if (x == null) return null;
  if (typeof x === "number") {
    const ms = x < 1e12 ? x * 1000 : x; // sec -> ms
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof x === "string") {
    // numeric string?
    if (/^\d+$/.test(x)) {
      const n = Number(x);
      return toDateMaybe(n);
    }
    const d = new Date(x);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function fmtJST(x: any): string {
  const d = toDateMaybe(x);
  if (!d) return "-";
  try {
    return new Intl.DateTimeFormat("ja-JP", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Tokyo",
    }).format(d);
  } catch {
    return d.toISOString();
  }
}

export default function VClient() {
  const sp = useSearchParams();

  const q = useMemo(() => {
    const proofId = sp.get("proofId") || undefined;
    const hash = sp.get("hash") || undefined;
    const sig = sp.get("sig") || undefined;
    const kid = sp.get("kid") || undefined;
    const alg = sp.get("alg") || undefined;
    return { proofId, hash, sig, kid, alg };
  }, [sp]);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<VerifyResponse | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const result: Result | null = useMemo(() => {
    if (!data?.result) return null;
    const r = String(data.result).toUpperCase();
    if (r === "OK" || r === "NG" || r === "REVOKED" || r === "UNKNOWN") return r as Result;
    return null;
  }, [data]);

  const showContact = result === "NG" || result === "UNKNOWN";

  const contactMailto = useMemo(() => {
    if (!data) return "";
    const subject = "Proof Verification Issue";

    const bodyLines = [
      "Proof Verification Issue",
      "",
      `proofId: ${q.proofId ?? "-"}`,
      `result: ${String(data.result ?? "-")}`,
      `error: ${data.error ?? "-"}`,
      `verified: ${typeof data.verified === "boolean" ? String(data.verified) : "-"}`,
      "",
      `page_url: ${typeof window !== "undefined" ? window.location.href : "-"}`,
      "",
      `kid: ${q.kid ?? data.kid ?? "-"}`,
      `alg: ${q.alg ?? data.alg ?? "-"}`,
      `hash: ${q.hash ?? data.payload_hash_b64u ?? "-"}`,
      "",
      "response_json:",
      JSON.stringify(data, null, 2),
      "",
      "Please advise next steps.",
    ];

    const body = bodyLines.join("\n");
    return `mailto:contact@luminabulige.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [data, q]);

  async function runVerify() {
    setErrorText(null);
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (q.proofId) params.set("proofId", q.proofId);
      if (q.hash) params.set("hash", q.hash);
      if (q.sig) params.set("sig", q.sig);
      if (q.kid) params.set("kid", q.kid);
      if (q.alg) params.set("alg", q.alg);

      const res = await fetch(`/api/verify?${params.toString()}`, { method: "GET" });
      const json = (await res.json()) as VerifyResponse;

      setData(json);
      if (!res.ok) {
        setErrorText(json?.error ? `${json.error}` : `HTTP ${res.status}`);
      }
    } catch (e: any) {
      setErrorText(e?.message || String(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  const hasParams = !!(q.proofId || (q.hash && q.sig && q.kid && q.alg));
  const hasProof = !!data?.proof;

  const explanation = useMemo(() => {
    if (!data || !result) return null;

    // verified=false かつ proofId がある場合の説明（要件）
    if (result === "NG" && q.proofId) {
      return "proofId は存在しますが署名が一致しません。URL改ざん、転記ミス、または署名不一致の可能性があります。";
    }
    if (result === "NG" && !q.proofId) {
      return "署名が一致しません。入力値（hash / sig / kid / alg）の転記ミスや改ざんの可能性があります。";
    }
    if (result === "UNKNOWN") {
      return "kid に対応する公開鍵が取得できません。発行元側の鍵ローテーション、または入力値の不整合の可能性があります。";
    }
    if (result === "REVOKED") {
      return "この Proof は発行元により無効化されています（検証自体は実施済みとして扱います）。";
    }
    if (result === "OK") {
      return "検証は成功しました。表示される Proof 情報は発行元DB（または一致した記録）に基づきます。";
    }
    return null;
  }, [data, result, q.proofId]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: ui.color.bg,
        padding: ui.space.xxl,
        fontFamily: ui.font.ui,
      }}
    >
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ marginBottom: ui.space.lg }}>
          <div style={{ color: "#E5E7EB", fontSize: 13, letterSpacing: 0.2 }}>LUMINA BULIGE</div>
          <h1 style={{ color: "#FFFFFF", margin: "6px 0 0", fontSize: 26, lineHeight: 1.2 }}>
            Proof Verification
          </h1>
          <div style={{ color: "rgba(255,255,255,0.72)", marginTop: 8, fontSize: 14 }}>
            QR / API で渡された値をもとに署名検証を行い、結果と根拠を表示します。
          </div>
        </div>

        {/* Action bar */}
        <div
          style={{
            display: "flex",
            gap: ui.space.md,
            flexWrap: "wrap",
            marginBottom: ui.space.lg,
            alignItems: "center",
          }}
        >
          <button
            onClick={runVerify}
            disabled={!hasParams || loading}
            style={{
              appearance: "none",
              border: `1px solid ${ui.color.border}`,
              background: hasParams ? "#FFFFFF" : "rgba(255,255,255,0.75)",
              borderRadius: ui.radius.md,
              padding: "10px 14px",
              fontWeight: 700,
              cursor: hasParams && !loading ? "pointer" : "not-allowed",
              boxShadow: ui.shadow.soft,
            }}
            title={!hasParams ? "proofId または (hash,sig,kid,alg) が必要です" : ""}
          >
            {loading ? "Verifying…" : "検証する"}
          </button>

          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>
            入力:{" "}
            <span style={{ fontFamily: ui.font.mono }}>
              proofId={q.proofId ? shortHash(q.proofId, 10, 6) : "-"} / hash={q.hash ? "yes" : "no"} / sig=
              {q.sig ? "yes" : "no"} / kid={q.kid ? shortHash(q.kid, 10, 6) : "-"} / alg={q.alg ?? "-"}
            </span>
          </div>
        </div>

        {/* Result card */}
        <section
          style={{
            border: `1px solid ${ui.color.border}`,
            borderRadius: ui.radius.lg,
            padding: ui.space.xl,
            background: ui.color.card,
            boxShadow: ui.shadow.card,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, color: ui.color.sub, marginBottom: 6 }}>結果</div>

              {result ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span
                    style={{
                      ...badgeStyle(result),
                      padding: "6px 10px",
                      borderRadius: ui.radius.pill,
                      fontWeight: 800,
                      fontSize: 13,
                      letterSpacing: 0.4,
                    }}
                  >
                    {result}
                  </span>

                  <span style={{ color: ui.color.text, fontWeight: 800, fontSize: 16 }}>
                    {CRITERIA[result]}
                  </span>
                </div>
              ) : (
                <div style={{ color: ui.color.sub }}>
                  まだ検証していません（上の「検証する」を押してください）
                </div>
              )}

              {explanation && (
                <div style={{ marginTop: ui.space.sm, color: ui.color.sub, lineHeight: 1.6 }}>
                  {explanation}
                </div>
              )}

              {errorText && (
                <div
                  style={{
                    marginTop: ui.space.md,
                    background: ui.color.soft,
                    border: `1px solid ${ui.color.border}`,
                    borderRadius: ui.radius.md,
                    padding: ui.space.md,
                    color: ui.color.text,
                  }}
                >
                  <div style={{ fontWeight: 800, marginBottom: 6 }}>エラー</div>
                  <div style={{ fontFamily: ui.font.mono, fontSize: 12, whiteSpace: "pre-wrap" }}>{errorText}</div>
                </div>
              )}
            </div>

            {showContact && data && (
              <a
                href={contactMailto}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "10px 12px",
                  borderRadius: ui.radius.md,
                  border: `1px solid ${ui.color.border}`,
                  background: "#FFFFFF",
                  color: ui.color.link,
                  fontWeight: 800,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                発行元に問い合わせ
              </a>
            )}
          </div>

          {/* Proof card */}
          <div style={{ marginTop: ui.space.xl }}>
            <div style={{ fontSize: 13, color: ui.color.sub, marginBottom: ui.space.sm }}>Proof 情報</div>

            <div
              style={{
                background: ui.color.soft,
                border: `1px solid ${ui.color.border}`,
                borderRadius: ui.radius.md,
                padding: ui.space.lg,
              }}
            >
              {hasProof ? (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 10 }}>
                    <div style={{ color: ui.color.sub }}>proof_id</div>
                    <div style={{ fontFamily: ui.font.mono }}>{data?.proof?.proof_id ?? "-"}</div>

                    <div style={{ color: ui.color.sub }}>期間</div>
                    <div>
                      {data?.proof?.range?.from ?? "-"} 〜 {data?.proof?.range?.to ?? "-"}
                    </div>

                    <div style={{ color: ui.color.sub }}>作成</div>
                    <div>{fmtJST(data?.proof?.created_at_ts)}</div>

                    <div style={{ color: ui.color.sub }}>カウント</div>
                    <div>
                      SAFE {data?.proof?.counts?.SAFE ?? 0} / WARNING {data?.proof?.counts?.WARNING ?? 0} / DANGER{" "}
                      {data?.proof?.counts?.DANGER ?? 0} / total {data?.proof?.counts?.total ?? 0}
                    </div>

                    <div style={{ color: ui.color.sub }}>ruleset_version</div>
                    <div style={{ fontFamily: ui.font.mono }}>{data?.proof?.ruleset_version ?? "-"}</div>

                    <div style={{ color: ui.color.sub }}>kid / alg</div>
                    <div style={{ fontFamily: ui.font.mono }}>
                      {data?.proof?.kid ?? data?.kid ?? "-"} / {data?.proof?.alg ?? data?.alg ?? "-"}
                    </div>

                    <div style={{ color: ui.color.sub }}>payload_hash_b64u</div>
                    <div style={{ fontFamily: ui.font.mono }}>
                      {data?.proof?.payload_hash_b64u ?? data?.payload_hash_b64u ?? "-"}
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ color: ui.color.sub, lineHeight: 1.7 }}>
                  proof 情報が取得できませんでした。
                  <br />
                  <span style={{ color: ui.color.weak }}>
                    （proofId 未指定、または hash に一致する proof が存在しない可能性があります）
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Details (audit-friendly) */}
          {data && (
            <div style={{ marginTop: ui.space.lg }}>
              <details>
                <summary style={{ cursor: "pointer", color: ui.color.link, fontWeight: 800 }}>
                  技術詳細（レスポンスJSON）
                </summary>
                <pre
                  style={{
                    marginTop: ui.space.sm,
                    padding: ui.space.md,
                    borderRadius: ui.radius.md,
                    border: `1px solid ${ui.color.border}`,
                    background: "#0F172A",
                    color: "#E5E7EB",
                    overflowX: "auto",
                    fontSize: 12,
                    lineHeight: 1.5,
                  }}
                >
                  {JSON.stringify(data, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </section>

        {/* Footer */}
        <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: ui.space.lg, lineHeight: 1.6 }}>
          注意: NG / UNKNOWN の場合は、入力値（hash/sig/kid/alg）や QR の転記ミス、改ざん、鍵ローテーション等が原因になり得ます。
        </div>
      </div>
    </main>
  );
}
