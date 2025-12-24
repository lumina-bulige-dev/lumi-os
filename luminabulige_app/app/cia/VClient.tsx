"use client";
import { ui } from "./ui";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loadJSON, saveJSON, uid } from "./storage";
import { PARENTS, DEFAULT_CHILDREN, childrenOf } from "./categories";
import type { CategoryChild } from "./model";
/** ===== Types (DB Views) =====
 * v_cia_customer:
 *  user_id, ym_jst, headline_ja, highlight_ja, safe_rate_pct, trust_flag, institutional_score,
 *  total_count, danger_count, risk_count, last_proof_id
 *
 * v_cia_institutional:
 *  user_id, ym_jst, raw_x1e4, cap_x1e4, safe_rate_pct, trust_flag, strength_score, institutional_score,
 *  total_count, danger_count, risk_count, last_proof_id
 */
type CIAReportRow = {
  user_id: string;
  ym_jst: string; // "YYYY-MM"
  headline_ja: string;
  highlight_ja: string;
  safe_rate_pct: number; // 例: 99.9999
  trust_flag: number; // 0/1
  institutional_score: number;

  total_count: number;
  danger_count: number;
  risk_count: number;
  last_proof_id: string | null;
};

type CIAAppendixRow = {
  user_id: string;
  ym_jst: string;

  raw_x1e4: number;
  cap_x1e4: number;
  safe_rate_pct: number;

  trust_flag: number;
  strength_score: number;
  institutional_score: number;

  total_count: number;
  danger_count: number;
  risk_count: number;
  last_proof_id: string | null;
};

type CIAResponse = {
  userId: string;
  report: CIAReportRow[];
  appendix: CIAAppendixRow[];
  meta?: {
    generated_at_ts?: number;
    range?: { fromYm?: string; toYm?: string };
  };
};

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

        /* 背景色を印刷に反映（必要なら） */
        * {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        /* 画面用の余白を除去 */
        main {
          background: #fff !important;
          padding: 0 !important;
          min-height: auto !important;
        }

        /* 印刷に不要なUIは消す（残したいボタンだけ .print-keep） */
        button:not(.print-keep),
        .no-print {
          display: none !important;
        }

        /* 2ページ固定：Report → Appendix で必ず改ページ */
        .print-page {
          break-after: page;
          page-break-after: always;
        }
        .print-last {
          break-after: auto;
          page-break-after: auto;
        }

        /* 改ページ事故を減らす */
        .avoid-break {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        /* 長い文字列は折り返し */
        pre,
        code,
        .mono {
          white-space: pre-wrap !important;
          word-break: break-word !important;
          overflow: visible !important;
        }
      }
    `}</style>
  );
}

function shortHash(s?: string | null, head = 10, tail = 6) {
  if (!s) return "-";
  if (s.length <= head + tail + 3) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}

function fmtPct(x: number) {
  // safe_rate_pct は小数点4桁まで出す想定（99.9999）
  if (!Number.isFinite(x)) return "-";
  return `${x.toFixed(4)}%`;
}

async function generateProof(payload: any) {
  const res = await fetch("/api/proofs", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ payload }),
  });
  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.ok) throw new Error(json?.error ?? "proof create failed");

  const proofId = json.proof?.proofId ?? json.proofId;
  if (!proofId) throw new Error("proofId missing");

  window.location.href = `/v?proofId=${encodeURIComponent(proofId)}`;
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
      className="no-print"
      onClick={async () => {
        if (!p.value) return;
        const ok = await copyToClipboard(p.value);
        if (ok) {
          setCopied(true);
          setTimeout(() => setCopied(false), 900);
        }
      }}
      disabled={disabled}
      style={{
        appearance: "none",
        border: `1px solid ${ui.color.border}`,
        background: "#FFFFFF",
        borderRadius: ui.radius.pill,
        padding: "6px 10px",
        fontSize: 12,
        fontWeight: 900,
        cursor: disabled ? "not-allowed" : "pointer",
        color: disabled ? ui.color.weak : ui.color.text,
        boxShadow: ui.shadow.soft,
      }}
      title={p.value ? `Copy ${p.label ?? ""}` : "コピー対象がありません"}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function Badge(p: { trust: number }) {
  const ok = p.trust === 1;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderRadius: ui.radius.pill,
        border: `1px solid ${ui.color.border}`,
        background: ok ? ui.color.okBg : ui.color.soft,
        color: ok ? ui.color.ok : ui.color.text,
        fontWeight: 900,
        fontSize: 12,
        letterSpacing: 0.4,
      }}
    >
      {ok ? "VERIFIED / TRUST" : "CHECK"}
    </span>
  );
}

function ReportCard(p: { row: CIAReportRow; verifyUrlBase: string }) {
  const r = p.row;
  const verifyUrl = r.last_proof_id
    ? `${p.verifyUrlBase}?proofId=${encodeURIComponent(r.last_proof_id)}`
    : "";

  return (
    <div
      className="avoid-break"
      style={{
        background: "#FFFFFF",
        border: `1px solid ${ui.color.border}`,
        borderRadius: ui.radius.lg,
        padding: 14,
        boxShadow: ui.shadow.card,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ fontSize: 14, fontWeight: 1000, color: ui.color.text }}>{r.ym_jst}</div>
          <Badge trust={r.trust_flag} />
          <div style={{ fontSize: 12, color: ui.color.sub }}>
            安全率 <span style={{ color: ui.color.text, fontWeight: 1000 }}>{fmtPct(r.safe_rate_pct)}</span>
          </div>
        </div>

        <div style={{ fontSize: 12, color: ui.color.sub }}>
          Institutional Score{" "}
          <span style={{ color: ui.color.text, fontWeight: 1000 }}>{r.institutional_score}</span>
        </div>
      </div>

      <div style={{ marginTop: 10, fontSize: 16, fontWeight: 1000, color: ui.color.text }}>{r.headline_ja}</div>
      <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.7, color: ui.color.sub }}>{r.highlight_ja}</div>

      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <div style={{ background: ui.color.soft, border: `1px solid ${ui.color.border}`, borderRadius: 12, padding: 10 }}>
          <div style={{ fontSize: 11, color: ui.color.sub }}>総イベント</div>
          <div style={{ fontSize: 16, fontWeight: 1000, color: ui.color.text }}>{r.total_count}</div>
        </div>
        <div style={{ background: ui.color.soft, border: `1px solid ${ui.color.border}`, borderRadius: 12, padding: 10 }}>
          <div style={{ fontSize: 11, color: ui.color.sub }}>DANGER</div>
          <div style={{ fontSize: 16, fontWeight: 1000, color: ui.color.text }}>{r.danger_count}</div>
        </div>
        <div style={{ background: ui.color.soft, border: `1px solid ${ui.color.border}`, borderRadius: 12, padding: 10 }}>
          <div style={{ fontSize: 11, color: ui.color.sub }}>疑義（risk）</div>
          <div style={{ fontSize: 16, fontWeight: 1000, color: ui.color.text }}>{r.risk_count}</div>
        </div>
      </div>

      {/* proof row */}
      <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontSize: 12, color: ui.color.sub }}>
          proof_id:{" "}
          <span className="mono" style={{ fontFamily: ui.font.mono, color: ui.color.text }}>
            {shortHash(r.last_proof_id)}
          </span>
        </div>

        {verifyUrl ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <a
              className="no-print"
              href={verifyUrl}
              style={{ color: ui.color.link, fontWeight: 1000, textDecoration: "none", fontSize: 12 }}
            >
              改ざん検証へ
            </a>
            <CopyButton value={verifyUrl} label="verify_url" />
          </div>
        ) : (
          <div className="no-print" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ fontSize: 12, color: ui.color.weak }}>proof未発行</div>

            <button
              onClick={() =>
                generateProof({
                  kind: "cia_monthly",
                  user_id: r.user_id,
                  ym_jst: r.ym_jst,
                  headline_ja: r.headline_ja,
                  highlight_ja: r.highlight_ja,
                  safe_rate_pct: r.safe_rate_pct,
                  institutional_score: r.institutional_score,
                  total_count: r.total_count,
                  danger_count: r.danger_count,
                  risk_count: r.risk_count,
                })
              }
              style={{
                appearance: "none",
                border: `1px solid ${ui.color.border}`,
                background: ui.color.okBg,
                color: ui.color.ok,
                borderRadius: ui.radius.md,
                padding: "8px 10px",
                fontWeight: 1000,
                cursor: "pointer",
                boxShadow: ui.shadow.soft,
                fontSize: 12,
                whiteSpace: "nowrap",
              }}
              title="proofを生成して /v に飛びます"
            >
              proof生成
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AppendixTable(p: { rows: CIAAppendixRow[]; verifyUrlBase: string }) {
  return (
    <div
      className="avoid-break"
      style={{
        background: "#FFFFFF",
        border: `1px solid ${ui.color.border}`,
        borderRadius: ui.radius.lg,
        padding: 14,
        boxShadow: ui.shadow.card,
      }}
    >
      <div style={{ fontSize: 12, color: ui.color.sub, marginBottom: 10 }}>
        監査用：数値はDBのVIEWそのまま。UIは“見せてるだけ”。
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              {[
                "ym",
                "safe_rate(%)",
                "trust",
                "strength",
                "inst_score",
                "total",
                "danger",
                "risk",
                "proof_id",
                "verify_url",
              ].map((h) => (
                <th key={h} style={{ borderBottom: `1px solid ${ui.color.border}`, padding: "8px 6px", color: ui.color.sub, fontWeight: 1000 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {p.rows.map((r) => {
              const verifyUrl = r.last_proof_id ? `${p.verifyUrlBase}?proofId=${encodeURIComponent(r.last_proof_id)}` : "";
              return (
                <tr key={`${r.user_id}_${r.ym_jst}`}>
                  <td style={{ borderBottom: `1px solid ${ui.color.border}`, padding: "8px 6px", fontWeight: 1000 }}>{r.ym_jst}</td>
                  <td style={{ borderBottom: `1px solid ${ui.color.border}`, padding: "8px 6px" }}>{fmtPct(r.safe_rate_pct)}</td>
                  <td style={{ borderBottom: `1px solid ${ui.color.border}`, padding: "8px 6px" }}>{r.trust_flag}</td>
                  <td style={{ borderBottom: `1px solid ${ui.color.border}`, padding: "8px 6px" }}>{r.strength_score}</td>
                  <td style={{ borderBottom: `1px solid ${ui.color.border}`, padding: "8px 6px" }}>{r.institutional_score}</td>
                  <td style={{ borderBottom: `1px solid ${ui.color.border}`, padding: "8px 6px" }}>{r.total_count}</td>
                  <td style={{ borderBottom: `1px solid ${ui.color.border}`, padding: "8px 6px" }}>{r.danger_count}</td>
                  <td style={{ borderBottom: `1px solid ${ui.color.border}`, padding: "8px 6px" }}>{r.risk_count}</td>
                  <td style={{ borderBottom: `1px solid ${ui.color.border}`, padding: "8px 6px", fontFamily: ui.font.mono }}>
                    {shortHash(r.last_proof_id)}
                  </td>
                  <td style={{ borderBottom: `1px solid ${ui.color.border}`, padding: "8px 6px" }}>
                    {verifyUrl ? (
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <a className="no-print" href={verifyUrl} style={{ color: ui.color.link, textDecoration: "none", fontWeight: 1000 }}>
                          link
                        </a>
                        <CopyButton value={verifyUrl} label="verify_url" />
                      </div>
                    ) : (
                      <span style={{ color: ui.color.weak }}>-</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {p.rows.length === 0 && (
              <tr>
                <td colSpan={10} style={{ padding: 10, color: ui.color.sub }}>
                  データなし（ユーザーがまだログを持っていない / rollup未生成 / userId不一致）
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 10, fontSize: 11, color: ui.color.weak }}>
        raw_x1e4 / cap_x1e4 は API で返しても良いが、監査の“読める表”としては safe_rate_pct が主。
      </div>
    </div>
  );
}


const LS = {
  categories: "cia.categories.v1",
};
export default function VClient() {
  const sp = useSearchParams();
const [catChildren, setCatChildren] = useState<CategoryChild[]>(
  () => loadJSON(LS.categories, DEFAULT_CHILDREN)
);
const [parentId, setParentId] = useState<string>(PARENTS[0].id);
const [childId, setChildId] = useState<string>(() => {
  const first = childrenOf(loadJSON(LS.categories, DEFAULT_CHILDREN), PARENTS[0].id)[0];
  return first?.id ?? "";
});
const [newChildLabel, setNewChildLabel] = useState("");

  
  useEffect(() => {
  saveJSON(LS.categories, catChildren);
}, [catChildren]);

useEffect(() => {
  const list = childrenOf(catChildren, parentId);
  const nextId = list.some((c) => c.id === childId) ? childId : (list[0]?.id ?? "");
  if (nextId !== childId) setChildId(nextId);
}, [parentId, catChildren]); // childId外す

  
  const userId = useMemo(() => sp.get("userId") || "test-user", [sp]);
  const apiBase = useMemo(() => sp.get("apiBase") || "/api/cia", [sp]);
  const verifyUrlBase = useMemo(() => sp.get("verifyBase") || "/v", [sp]); // 例: /v?proofId=...

  const [loading, setLoading] = useState(false);

  
  const [data, setData] = useState<CIAResponse | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  async function loadCIA() {
    setLoading(true);
    setErrorText(null);
    try {
      const url = `${apiBase}?userId=${encodeURIComponent(userId)}&limit=12`;
      const res = await fetch(url, { method: "GET" });
      const json = (await res.json()) as CIAResponse;
      if (!res.ok) throw new Error((json as any)?.error || `HTTP ${res.status}`);
      setData(json);
    } catch (e: any) {
      setErrorText(e?.message || String(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  const onPdf = () => window.print();

  return (
    <>
      <PrintStyles />

      <main
        style={{
          minHeight: "100vh",
          background: ui.color.bg,
          padding: ui.space.xxl,
          fontFamily: ui.font.ui,
        }}
      >
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: ui.space.lg }}>
            <div style={{ color: "rgba(255,255,255,0.78)", fontSize: 12, letterSpacing: 0.9 }}>LUMINA BULIGE</div>
            <h1 style={{ color: "#FFFFFF", margin: "6px 0 0", fontSize: 28, lineHeight: 1.2 }}>
              LUMINA CIA
            </h1>
            <div style={{ color: "rgba(255,255,255,0.72)", marginTop: 10, fontSize: 14, lineHeight: 1.7 }}>
              Customer Insight / Institutional Audit を同一データから二面展開（Report + Appendix）。
            </div>
          </div>

          {/* Actions */}
          <div
            className="no-print"
            style={{
              display: "flex",
              gap: ui.space.md,
              flexWrap: "wrap",
              marginBottom: ui.space.lg,
              alignItems: "center",
            }}
          >
            <button
              onClick={loadCIA}
              disabled={loading}
              style={{
                appearance: "none",
                border: `1px solid ${ui.color.border}`,
                background: "#FFFFFF",
                borderRadius: ui.radius.md,
                padding: "11px 14px",
                fontWeight: 1000,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: ui.shadow.soft,
              }}
            >
              {loading ? "Loading…" : "月次CIAを取得"}
            </button>

            <button
              className="print-keep"
              onClick={onPdf}
              style={{
                appearance: "none",
                border: `1px solid ${ui.color.border}`,
                background: "rgba(255,255,255,0.9)",
                borderRadius: ui.radius.md,
                padding: "11px 14px",
                fontWeight: 1000,
                cursor: "pointer",
                boxShadow: ui.shadow.soft,
              }}
              title="2ページ（Report / Appendix）でPDF出力"
            >
              PDF（2ページ）
            </button>

            <div style={{ color: "rgba(255,255,255,0.72)", fontSize: 12 }}>
              userId: <span style={{ fontFamily: ui.font.mono }}>{userId}</span>
            </div>
          </div>

          {/* Errors */}
          {errorText && (
            <div
              style={{
                marginBottom: ui.space.lg,
                background: ui.color.soft,
                border: `1px solid ${ui.color.border}`,
                borderRadius: ui.radius.md,
                padding: ui.space.md,
                color: ui.color.text,
              }}
            >
              <div style={{ fontWeight: 1000, marginBottom: 6 }}>エラー</div>
              <div style={{ fontFamily: ui.font.mono, fontSize: 12, whiteSpace: "pre-wrap" }}>{errorText}</div>
            </div>
          )}

          {/* ===== Page 1: CIA Report (Customer) ===== */}
          <section
            className="print-page"
            style={{
              border: `1px solid rgba(229,231,235,0.9)`,
              borderRadius: ui.radius.lg,
              padding: ui.space.xl,
              background: "#FFFFFF",
              boxShadow: ui.shadow.card,
            }}
          >
            <div className="no-print">
            {/* 親カテゴリ（14固定・必須） */}
<div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
  <div style={{ width: 110, fontSize: 12, color: ui.color.sub }}>親カテゴリ</div>
  <select
    value={parentId}
    onChange={(e) => setParentId(e.target.value)}
    style={{
      flex: 1,
      padding: "10px 12px",
      borderRadius: ui.radius.md,
      border: `1px solid ${ui.color.border}`,
      background: "#fff",
      fontWeight: 900,
    }}
  >
    {PARENTS.map((p) => (
      <option key={p.id} value={p.id}>
        {p.label}
      </option>
    ))}
  </select>
</div>

{/* 子カテゴリ（ユーザー追加可・端末保存） */}
<div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
  <div style={{ width: 110, fontSize: 12, color: ui.color.sub }}>子カテゴリ</div>
  <select
    value={childId}
    onChange={(e) => setChildId(e.target.value)}
    style={{
      flex: 1,
      padding: "10px 12px",
      borderRadius: ui.radius.md,
      border: `1px solid ${ui.color.border}`,
      background: "#fff",
      fontWeight: 900,
    }}
  >
    {childrenOf(catChildren, parentId).map((c) => (
      <option key={c.id} value={c.id}>
        {c.label}
      </option>
    ))}
  </select>
</div>

{/* 子カテゴリの追加 */}
<div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
  <div style={{ width: 110, fontSize: 12, color: ui.color.sub }}>追加</div>

  <input
    value={newChildLabel}
    onChange={(e) => setNewChildLabel(e.target.value)}
    placeholder="例: カフェ / 交際費 / 書籍 など"
    style={{
      flex: 1,
      padding: "10px 12px",
      borderRadius: ui.radius.md,
      border: `1px solid ${ui.color.border}`,
      background: "#fff",
      fontWeight: 900,
    }}
  />

  <button
    type="button"
    onClick={() => {
      const label = newChildLabel.trim();
      if (!label) return;
      const id = uid("child");
      const next = [...catChildren, { id, parentId, label }];
      setCatChildren(next);
      setNewChildLabel("");
      setChildId(id);
    }}
    style={{
      padding: "10px 12px",
      borderRadius: ui.radius.md,
      border: `1px solid ${ui.color.border}`,
      background: ui.color.okBg,
      color: ui.color.ok,
      fontWeight: 1000,
      cursor: "pointer",
      whiteSpace: "nowrap",
    }}
  >
    追加
  </button>
</div>
              </div>  {/* ← これを追加：no-print を閉じる */}
) : (
  <div className="no-print" style={{ display: "flex", gap: 8, alignItems: "center" }}>
    <div style={{ fontSize: 12, color: ui.color.weak }}>proof未発行</div>

    <button
      onClick={async () => {
        await generateProof({
          kind: "cia_monthly",
          user_id: r.user_id,
          ym_jst: r.ym_jst,
          headline_ja: r.headline_ja,
          highlight_ja: r.highlight_ja,
          safe_rate_pct: r.safe_rate_pct,
          institutional_score: r.institutional_score,
          total_count: r.total_count,
          danger_count: r.danger_count,
          risk_count: r.risk_count,
        });
      }}
      style={{
        appearance: "none",
        border: `1px solid ${ui.color.border}`,
        background: ui.color.okBg,
        color: ui.color.ok,
        borderRadius: ui.radius.md,
        padding: "8px 10px",
        fontWeight: 1000,
        cursor: "pointer",
        boxShadow: ui.shadow.soft,
        fontSize: 12,
        whiteSpace: "nowrap",
      }}
      title="proofを生成して /v に飛びます"
    >
      proof生成
    </button>
  </div>
)}


            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: ui.color.sub, marginBottom: 8, letterSpacing: 0.3 }}>
                  CIA Report (Customer)
                </div>
                <div style={{ fontSize: 18, fontWeight: 1000, color: ui.color.text }}>
                  月別インサイト（続けたくなる方）
                </div>
                <div style={{ marginTop: 6, fontSize: 12, color: ui.color.sub, lineHeight: 1.6 }}>
                  目的：ユーザーが「自分の状態」を一瞬で理解し、継続したくなる。監査の裏取りは proof で担保。
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: ui.color.sub }}>出力</div>
                <div style={{ fontSize: 12, color: ui.color.text, fontWeight: 1000 }}>A4 / Page 1</div>
              </div>
            </div>

            <div style={{ marginTop: ui.space.lg, display: "grid", gap: 12 }}>
              {(data?.report ?? []).map((row) => (
                <ReportCard key={`${row.user_id}_${row.ym_jst}`} row={row} verifyUrlBase={verifyUrlBase} />
              ))}
              {!data && (
                <div style={{ color: ui.color.sub, lineHeight: 1.7 }}>
                  まだデータを取得していません。上の「月次CIAを取得」を押してください。
                </div>
              )}
              {data && (data.report?.length ?? 0) === 0 && (
                <div style={{ color: ui.color.sub, lineHeight: 1.7 }}>
                  月次データがありません（rollup未作成 / userId不一致 / まだログがない）。
                </div>
              )}
            </div>

            <div style={{ marginTop: ui.space.lg, color: ui.color.weak, fontSize: 11, lineHeight: 1.7 }}>
              注：このページは“評価・要約”のための表示です。監査や機械判定は次ページ（Appendix）を参照。
            </div>
          </section>

          {/* ===== Page 2: CIA Appendix (Institutional Audit) ===== */}
          <section
            className="print-last"
            style={{
              marginTop: ui.space.lg,
              border: `1px solid rgba(229,231,235,0.9)`,
              borderRadius: ui.radius.lg,
              padding: ui.space.xl,
              background: "#FFFFFF",
              boxShadow: ui.shadow.card,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: ui.color.sub, marginBottom: 8, letterSpacing: 0.3 }}>
                  CIA Appendix (Institutional Audit)
                </div>
                <div style={{ fontSize: 18, fontWeight: 1000, color: ui.color.text }}>
                  監査付録（照合して使う方）
                </div>
                <div style={{ marginTop: 6, fontSize: 12, color: ui.color.sub, lineHeight: 1.6 }}>
                  目的：企業・機械が “a && b + c” を高速に使えるように、月次の監査参照値を表として提供。
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: ui.color.sub }}>出力</div>
                <div style={{ fontSize: 12, color: ui.color.text, fontWeight: 1000 }}>A4 / Page 2</div>
              </div>
            </div>

            <div style={{ marginTop: ui.space.lg }}>
              <AppendixTable rows={data?.appendix ?? []} verifyUrlBase={verifyUrlBase} />
            </div>

            <div style={{ marginTop: ui.space.lg, color: ui.color.weak, fontSize: 11, lineHeight: 1.7 }}>
              注：数値は v_cia_institutional / v_monthly_kpis に依存。改ざん検証は proof_id → verify に集約。
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
