"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ProofSummary } from "@/app/types/proof";
import { ciaUi as ui } from "@/app/v/ciaUi";

type VerifyResultT = "OK" | "NG" | "REVOKED" | "UNKNOWN";

type VerifyResponse = {
  ok: boolean;
  result: VerifyResultT | string;
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

const CRITERIA: Record<VerifyResultT, string> = {
  OK: "署名が一致しました",
  NG: "署名が一致しませんでした",
  REVOKED: "発行元が無効化しています",
  UNKNOWN: "鍵情報が取得できませんでした",
};

const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_ORIGIN ?? "https://api.luminabulige.com";

function toResult(x: unknown): VerifyResultT | null {
  if (x === "OK" || x === "NG" || x === "REVOKED" || x === "UNKNOWN") return x;
  return null;
}

function badgeStyle(r: VerifyResultT) {
  // ui.color.* は ciaUi 側でちゃんと揃える（ここでは存在する前提にしない）
  const base = {
    border: `1px solid rgba(15,23,42,0.18)`,
    background: "rgba(255,255,255,0.92)",
    color: "#0F172A",
  };

  if (r === "OK") return { ...base, background: "rgba(167,243,208,0.85)" };
  if (r === "NG") return { ...base, background: "rgba(252,165,165,0.85)" };
  if (r === "REVOKED") return { ...base, background: "rgba(253,230,138,0.85)" };
  return { ...base, background: "rgba(148,163,184,0.55)" };
}

function shortHash(s?: string | null, head = 10, tail = 6) {
  if (!s) return "";
  if (s.length <= head + tail + 3) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}

function toDateMaybe(x: any): Date | null {
  if (x == null) return null;
  if (typeof x === "number") {
    const ms = x < 1e12 ? x * 1000 : x;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof x === "string") {
    if (/^\d+$/.test(x)) return toDateMaybe(Number(x));
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

async function copyToClipboard(text: string) {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

function CopyButton(p: { value?: string | null; label?: string }) {
  const [copied, setCopied] = useState(false);
  const disabled = !p.value;

  return (
    <button
      onClick={async () => {
        if (!p.value) return;
        const ok = await copyToClipboard(p.value);
        if (ok) {
          setCopied(true);
          setTimeout(() => setCopied(false), 900);
        }
      }}
      disabled={disabled}
      aria-disabled={disabled}
      aria-live="polite"
      aria-label={p.value ? `Copy ${p.label ?? "value"}` : "Nothing to copy"}
      style={{
        appearance: "none",
        border: `1px solid rgba(15,23,42,0.18)`,
        background: "#FFFFFF",
        borderRadius: 999,
        padding: "6px 10px",
        fontSize: 12,
        fontWeight: 800,
        cursor: disabled ? "not-allowed" : "pointer",
        color: disabled ? "rgba(15,23,42,0.35)" : "#0F172A",
      }}
      title={p.value ? `Copy ${p.label ?? ""}` : "コピー対象がありません"}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function DownloadJsonButton({ json }: { json: unknown }) {
  return (
    <button
      onClick={() => {
        const blob = new Blob([JSON.stringify(json, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "verification_response.json";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }}
      style={{
        appearance: "none",
        border: `1px solid rgba(15,23,42,0.18)`,
        background: "#FFFFFF",
        borderRadius: 12,
        padding: "10px 12px",
        fontWeight: 900,
        cursor: "pointer",
        boxShadow: "0 6px 18px rgba(15,23,42,0.14)",
      }}
      title="レスポンスJSONをダウンロード"
    >
      JSONをダウンロード
    </button>
  );
}

function Row(p: { k: string; v: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "180px 1fr auto",
        gap: 10,
        alignItems: "start",
      }}
    >
      <div style={{ color: "rgba(15,23,42,0.55)", fontSize: 13, paddingTop: 2 }}>
        {p.k}
      </div>
      <div style={{ color: "#0F172A" }}>{p.v}</div>
      <div>{p.right}</div>
    </div>
  );
}

function PrintStyles() {
  return (
    <style jsx global>{`
      @page {
        size: A4;
        margin: 10mm;
      }
      @media print {
        html,
        body {
          background: #fff !important;
        }
        main {
          background: #fff !important;
          padding: 0 !important;
          min-height: auto !important;
        }
        * {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        button {
          display: none !important;
        }
        .print-one h1 {
          font-size: 18px !important;
          margin: 0 0 6px !important;
        }
        .print-one section {
          box-shadow: none !important;
          padding: 10px !important;
        }
        .print-one * {
          line-height: 1.25 !important;
        }
        .print-one [data-print="json"] {
          display: none !important;
        }
        .print-one [data-print="note"] {
          display: none !important;
        }
        .print-one section,
        .print-one div {
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .print-one pre,
        .print-one code,
        .print-one .mono {
          white-space: pre-wrap !important;
          word-break: break-word !important;
          overflow: visible !important;
        }
      }
    `}</style>
  );
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
  const [verifiedAt, setVerifiedAt] = useState<number | null>(null);

  const result: VerifyResultT | null = useMemo(() => toResult(data?.result), [data]);

  const explanation = useMemo(() => {
    if (!data || !result) return null;

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

  const showContact = result === "NG" || result === "UNKNOWN";

  const verifyUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, [q.proofId, q.hash, q.sig, q.kid, q.alg]);

  const abortRef = useRef<AbortController | null>(null);

  async function runVerify() {
    setErrorText(null);
    setLoading(true);

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const params = new URLSearchParams();
      if (q.proofId) params.set("proofId", q.proofId);
      if (q.hash) params.set("hash", q.hash);
      if (q.sig) params.set("sig", q.sig);
      if (q.kid) params.set("kid", q.kid);
      if (q.alg) params.set("alg", q.alg);

      const url = new URL("/verify", API_ORIGIN);
      params.forEach((v, k) => url.searchParams.set(k, v));

      const res = await fetch(url.toString(), { method: "GET", signal: ctrl.signal });
      const ct = res.headers.get("content-type") || "";
      const raw = await res.text();

      let json: VerifyResponse | null = null;
      if (ct.includes("application/json")) {
        try {
          json = raw ? (JSON.parse(raw) as VerifyResponse) : null;
        } catch {}
      }

      setVerifiedAt(Date.now());

      if (!res.ok) {
        setData(json);
        setErrorText(json?.error || `HTTP ${res.status} – ${raw.slice(0, 200)}…`);
        return;
      }

      setData(json);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setErrorText(e?.message || String(e));
      setData(null);
      setVerifiedAt(Date.now());
    } finally {
      setLoading(false);
    }
  }

  const hasParams = !!(q.proofId || (q.hash && q.sig && q.kid && q.alg));
  const hasProof = !!data?.proof;
  const showVerifiedFlag = typeof data?.verified === "boolean";

  const [printOne, setPrintOne] = useState(false);

  useEffect(() => {
    const onAfter = () => setPrintOne(false);
    window.addEventListener("afterprint", onAfter);
    return () => window.removeEventListener("afterprint", onAfter);
  }, []);

  const onPdfOne = () => {
    setPrintOne(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => window.print());
    });
  };

  const contactMailto = useMemo(() => {
    if (!data) return "";
    const subject = "Proof Verification Issue";
    const maxBody = 1800;
    const bodyLines = [
      "Proof Verification Issue",
      "",
      `proofId: ${q.proofId ?? "-"}`,
      `result: ${String(data.result ?? "-")}`,
      `error: ${data.error ?? "-"}`,
      `verified: ${typeof data.verified === "boolean" ? String(data.verified) : "-"}`,
      `verifiedAt(JST): ${verifiedAt ? fmtJST(verifiedAt) : "-"}`,
      "",
      `page_url: ${verifyUrl || "-"}`,
      "",
      `kid: ${q.kid ?? data.kid ?? "-"}`,
      `alg: ${q.alg ?? data.alg ?? "-"}`,
      `hash: ${q.hash ?? data.payload_hash_b64u ?? "-"}`,
      "",
      "response_json (truncated if needed):",
      JSON.stringify(data, null, 2),
    ];
    let body = bodyLines.join("\n");
    if (body.length > maxBody) body = body.slice(0, maxBody) + "\n...(truncated)…";
    return `mailto:contact@luminabulige.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  }, [data, q, verifiedAt, verifyUrl]);

  return (
    <React.Fragment>
      <PrintStyles />

      <main
        className={printOne ? "print-one" : ""}
        style={{
          minHeight: "100vh",
          background: (ui as any)?.color?.bg ?? "#0B1220",
          padding: (ui as any)?.space?.xxl ?? 24,
          fontFamily: (ui as any)?.font?.ui ?? "ui-sans-serif, system-ui",
        }}
      >
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ marginBottom: (ui as any)?.space?.lg ?? 16 }}>
            <div style={{ color: "rgba(255,255,255,0.78)", fontSize: 12, letterSpacing: 0.9 }}>
              LUMINA BULIGE
            </div>
            <h1 style={{ color: "#FFFFFF", margin: "6px 0 0", fontSize: 28, lineHeight: 1.2 }}>
              Proof Verification
            </h1>
            <div style={{ color: "rgba(255,255,255,0.72)", marginTop: 10, fontSize: 14, lineHeight: 1.7 }}>
              QR / API の値を用いて署名検証し、結果と根拠を提示します（監査・問い合わせ前提の表示）。
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
            <button
              onClick={runVerify}
              disabled={!hasParams || loading}
              style={{
                appearance: "none",
                border: `1px solid rgba(229,231,235,0.9)`,
                background: hasParams ? "#FFFFFF" : "rgba(255,255,255,0.78)",
                borderRadius: 12,
                padding: "11px 14px",
                fontWeight: 900,
                cursor: hasParams && !loading ? "pointer" : "not-allowed",
                boxShadow: "0 6px 18px rgba(15,23,42,0.14)",
                letterSpacing: 0.2,
              }}
              title={!hasParams ? "proofId または (hash,sig,kid,alg) が必要です" : ""}
            >
              {loading ? "Verifying…" : "検証する"}
            </button>

            <button
              onClick={onPdfOne}
              style={{
                appearance: "none",
                border: `1px solid rgba(229,231,235,0.9)`,
                background: "#FFFFFF",
                borderRadius: 12,
                padding: "11px 14px",
                fontWeight: 900,
                cursor: "pointer",
                boxShadow: "0 6px 18px rgba(15,23,42,0.14)",
              }}
              title="1ページに収まるように要点だけで印刷します"
            >
              1枚PDF
            </button>

            <div style={{ color: "rgba(255,255,255,0.72)", fontSize: 12, lineHeight: 1.6 }}>
              <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                proofId={q.proofId ? shortHash(q.proofId, 10, 6) : "-"} / hash={q.hash ? "yes" : "no"} / sig=
                {q.sig ? "yes" : "no"} / kid={q.kid ? shortHash(q.kid, 10, 6) : "-"} / alg={q.alg ?? "-"}
              </div>
            </div>
          </div>

          <section
            style={{
              border: `1px solid rgba(229,231,235,0.9)`,
              borderRadius: 16,
              padding: 20,
              background: "rgba(255,255,255,0.92)",
              boxShadow: "0 12px 30px rgba(15,23,42,0.18)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: "rgba(15,23,42,0.55)", marginBottom: 8, letterSpacing: 0.3 }}>
                  結果
                </div>

                {result ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span
                      style={{
                        ...badgeStyle(result),
                        padding: "6px 10px",
                        borderRadius: 999,
                        fontWeight: 900,
                        fontSize: 12,
                        letterSpacing: 0.6,
                      }}
                    >
                      {result}
                    </span>

                    <span style={{ color: "#0F172A", fontWeight: 900, fontSize: 16 }}>{CRITERIA[result]}</span>

                    {showVerifiedFlag && (
                      <span
                        role="status"
                        style={{
                          marginLeft: 6,
                          padding: "6px 10px",
                          borderRadius: 999,
                          border: `1px solid rgba(15,23,42,0.18)`,
                          background: "rgba(15,23,42,0.04)",
                          fontSize: 12,
                          fontWeight: 900,
                          color: "#0F172A",
                        }}
                      >
                        verified: {String(data?.verified)}
                      </span>
                    )}
                  </div>
                ) : (
                  <div style={{ color: "rgba(15,23,42,0.55)" }}>
                    まだ検証していません（上の「検証する」を押してください）
                  </div>
                )}

                <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ color: "rgba(15,23,42,0.55)", fontSize: 12 }}>
                    検証時刻（JST）:{" "}
                    <span style={{ color: "#0F172A", fontWeight: 900 }}>{verifiedAt ? fmtJST(verifiedAt) : "-"}</span>
                  </div>
                </div>

                {verifyUrl && (
                  <div style={{ marginTop: 10 }}>
                    <Row
                      k="verify_url"
                      v={
                        <span className="mono" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                          {shortHash(verifyUrl, 42, 14)}
                        </span>
                      }
                      right={<CopyButton value={verifyUrl} label="verify_url" />}
                    />
                  </div>
                )}

                {explanation && <div style={{ marginTop: 10, color: "rgba(15,23,42,0.6)", lineHeight: 1.7 }}>{explanation}</div>}

                {errorText && (
                  <div
                    style={{
                      marginTop: 12,
                      background: "rgba(15,23,42,0.04)",
                      border: `1px solid rgba(15,23,42,0.18)`,
                      borderRadius: 12,
                      padding: 12,
                      color: "#0F172A",
                    }}
                  >
                    <div style={{ fontWeight: 900, marginBottom: 6 }}>エラー</div>
                    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12, whiteSpace: "pre-wrap" }}>
                      {errorText}
                    </div>
                  </div>
                )}
              </div>

              {showContact && data && (
                <div style={{ minWidth: 240 }}>
                  <div style={{ marginTop: 10, marginBottom: 10, color: "rgba(15,23,42,0.6)", fontSize: 12, lineHeight: 1.6 }}>
                    問い合わせボタンを押すと、検証に必要な情報が本文に自動で入ります。
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <a
                      href={contactMailto}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: `1px solid rgba(15,23,42,0.18)`,
                        background: "#FFFFFF",
                        color: "#2563EB",
                        fontWeight: 900,
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      発行元に問い合わせ
                    </a>

                    <DownloadJsonButton json={data} />
                  </div>
                </div>
              )}
            </div>

            <div data-print="proof" style={{ marginTop: 18 }}>
              <div style={{ fontSize: 12, color: "rgba(15,23,42,0.55)", marginBottom: 10, letterSpacing: 0.3 }}>
                Proof 情報
              </div>

              <div style={{ background: "rgba(15,23,42,0.04)", border: `1px solid rgba(15,23,42,0.18)`, borderRadius: 12, padding: 14 }}>
                {hasProof ? (
                  <div style={{ display: "grid", gap: 10 }}>
                    <Row
                      k="proof_id"
                      v={
                        <span
                          className="mono"
                          style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
                          title={data?.proof?.proof_id ?? ""}
                        >
                          {shortHash(data?.proof?.proof_id ?? "-", 18, 10)}
                        </span>
                      }
                      right={<CopyButton value={data?.proof?.proof_id ?? null} label="proof_id" />}
                    />

                    <Row k="期間" v={<span>{data?.proof?.range?.from ?? "-"} 〜 {data?.proof?.range?.to ?? "-"}</span>} />
                    <Row k="作成" v={<span>{fmtJST(data?.proof?.created_at_ts)}</span>} />

                    {(() => {
                      const c = data?.proof?.counts;
                      const total = c?.total ?? ((c?.SAFE ?? 0) + (c?.WARNING ?? 0) + (c?.DANGER ?? 0));
                      return (
                        <Row
                          k="カウント"
                          v={<span>SAFE {c?.SAFE ?? 0} / WARNING {c?.WARNING ?? 0} / DANGER {c?.DANGER ?? 0} / total {total}</span>}
                        />
                      );
                    })()}

                    <Row k="ruleset_version" v={<span className="mono" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{data?.proof?.ruleset_version ?? "-"}</span>} />

                    <Row
                      k="kid"
                      v={
                        <span className="mono" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} title={(data?.proof?.kid ?? data?.kid) ?? ""}>
                          {shortHash((data?.proof?.kid ?? data?.kid) ?? "-", 18, 10)}
                        </span>
                      }
                      right={<CopyButton value={(data?.proof?.kid ?? data?.kid) ?? null} label="kid" />}
                    />

                    <Row
                      k="alg"
                      v={<span className="mono" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{data?.proof?.alg ?? data?.alg ?? "-"}</span>}
                      right={<CopyButton value={(data?.proof?.alg ?? data?.alg) ?? null} label="alg" />}
                    />

                    <Row
                      k="payload_hash_b64u"
                      v={
                        <span className="mono" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} title={(data?.proof?.payload_hash_b64u ?? data?.payload_hash_b64u) ?? ""}>
                          {shortHash((data?.proof?.payload_hash_b64u ?? data?.payload_hash_b64u) ?? "-", 22, 12)}
                        </span>
                      }
                      right={<CopyButton value={(data?.proof?.payload_hash_b64u ?? data?.payload_hash_b64u) ?? null} label="payload_hash_b64u" />}
                    />
                  </div>
                ) : (
                  <div style={{ color: "rgba(15,23,42,0.55)", lineHeight: 1.7 }}>
                    Proof 情報が取得できませんでした。
                    <br />
                    <span style={{ color: "rgba(15,23,42,0.35)" }}>
                      proofId 付きURLでの検証が最短で確実です（例: /v?proofId=xxxx）
                    </span>
                  </div>
                )}
              </div>
            </div>

            {data && (
              <div data-print="json" style={{ marginTop: 14 }}>
                <details>
                  <summary style={{ cursor: "pointer", color: "#2563EB", fontWeight: 900 }}>
                    技術詳細（レスポンスJSON）
                  </summary>
                  <pre
                    style={{
                      marginTop: 10,
                      padding: 12,
                      borderRadius: 12,
                      border: `1px solid rgba(15,23,42,0.18)`,
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

          <div data-print="note" style={{ color: "rgba(255,255,255,0.62)", fontSize: 12, marginTop: 14, lineHeight: 1.7 }}>
            注意: NG / UNKNOWN の場合は、入力値の転記ミス、改ざん、鍵ローテーション等が原因になり得ます。
          </div>
        </div>
      </main>
    </React.Fragment>
  );
}
