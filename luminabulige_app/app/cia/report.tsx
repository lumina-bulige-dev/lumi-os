// app/cia/page.tsx
"use client";

import Link from "next/link";

export default function CiaIndexPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#e5e7eb",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
        padding: "32px 16px",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Header */}
        <header style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#64748b",
              marginBottom: 4,
            }}
          >
            LUMINA BULIGE
          </div>
          <h1
            style={{
              fontSize: 24,
              lineHeight: 1.25,
              margin: 0,
              fontWeight: 700,
            }}
          >
            LUMI CIA Center
          </h1>
          <p
            style={{
              marginTop: 8,
              fontSize: 14,
              lineHeight: 1.7,
              color: "#cbd5f5",
            }}
          >
            改ざん検証・30日ログのエビデンス・倫理コアドキュメントへの入口です。
            一般ユーザー向けUIとは別レイヤーのページになります。
          </p>
        </header>

        {/* Cards */}
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          }}
        >
          {/* Card 1: 改ざん検証 */}
          <section
            style={{
              borderRadius: 16,
              border: "1px solid rgba(148,163,184,0.6)",
              background:
                "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.98))",
              padding: 16,
              boxShadow: "0 16px 40px rgba(15,23,42,0.8)",
            }}
          >
            <h2
              style={{
                fontSize: 14,
                margin: 0,
                marginBottom: 6,
                fontWeight: 600,
              }}
            >
              改ざん検証（Verify）
            </h2>
            <p
              style={{
                margin: 0,
                marginBottom: 12,
                fontSize: 12,
                lineHeight: 1.7,
                color: "#cbd5f5",
              }}
            >
              PDF やトークンの署名・整合性を確認する
              「Proof Verify」画面に進みます。
            </p>
            <Link
              href="/cia/verify"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: 36,
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                textDecoration: "none",
                border: "1px solid rgba(56,189,248,0.8)",
                background:
                  "linear-gradient(135deg, #38bdf8, #0ea5e9, #7dd3fc)",
                color: "#020617",
              }}
            >
              改ざん検証に進む
            </Link>
          </section>

          {/* Card 2: 30日ログエビデンス */}
          <section
            style={{
              borderRadius: 16,
              border: "1px solid rgba(148,163,184,0.6)",
              background:
                "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.98))",
              padding: 16,
              boxShadow: "0 16px 40px rgba(15,23,42,0.8)",
            }}
          >
            <h2
              style={{
                fontSize: 14,
                margin: 0,
                marginBottom: 6,
                fontWeight: 600,
              }}
            >
              30日ログ エビデンス
            </h2>
            <p
              style={{
                margin: 0,
                marginBottom: 12,
                fontSize: 12,
                lineHeight: 1.7,
                color: "#cbd5f5",
              }}
            >
              Compare で記録した SAFE / WARNING / DANGER の 30日分ログと、
              「Verified PDF」生成画面に移動します。
            </p>
            <Link
              href="/beta"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: 36,
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                textDecoration: "none",
                border: "1px solid rgba(148,163,184,0.8)",
                background: "rgba(15,23,42,0.9)",
                color: "#e5e7eb",
              }}
            >
              30日ログ（β）を開く
            </Link>
          </section>

          {/* Card 3: 倫理コア */}
          <section
            style={{
              borderRadius: 16,
              border: "1px solid rgba(148,163,184,0.6)",
              background:
                "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.98))",
              padding: 16,
              boxShadow: "0 16px 40px rgba(15,23,42,0.8)",
            }}
          >
            <h2
              style={{
                fontSize: 14,
                margin: 0,
                marginBottom: 6,
                fontWeight: 600,
              }}
            >
              倫理コア・設計ドキュメント
            </h2>
            <p
              style={{
                margin: 0,
                marginBottom: 12,
                fontSize: 12,
                lineHeight: 1.7,
                color: "#cbd5f5",
              }}
            >
              LUMI OS 倫理コア / 改ざん不能ログ設計 など、
              A：HQ が採択した仕様の概要にアクセスします。
            </p>
            <button
              type="button"
              disabled
              style={{
                width: "100%",
                height: 36,
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.6)",
                background: "rgba(15,23,42,0.8)",
                color: "#94a3b8",
                fontSize: 12,
                fontWeight: 600,
                cursor: "not-allowed",
              }}
            >
              準備中（Coming Soon）
            </button>
          </section>
        </div>

        <p
          style={{
            marginTop: 20,
            fontSize: 11,
            lineHeight: 1.7,
            color: "#64748b",
          }}
        >
          ※ CIA センターは、LUMI OS の信頼性と透明性を高めるための技術・ルール・エビデンスを統合する内部ハブです。
          一般ユーザー向けではなく、一部機能はβ版・準備中の状態を含みます。
        </p>
      </div>
    </main>
  );
}
