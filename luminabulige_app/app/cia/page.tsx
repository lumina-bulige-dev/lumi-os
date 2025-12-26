// app/cia/page.tsx
"use client";

import React, { useState } from "react";

type Result = "SAFE" | "WARNING" | "DANGER" | "UNKNOWN";

type VerifyResponse = {
  ok: boolean;
  result?: Result;
  message?: string;
  raw?: any;
};

export default function CiaPage() {
  const [jsonText, setJsonText] = useState("");
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify() {
    setError(null);
    setResp(null);

    let payload: any;
    try {
      payload = JSON.parse(jsonText);
    } catch {
      setError("JSON が壊れてます。まずは正しい JSON に直して。");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/cia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload }),
      });

      const data = (await res.json()) as VerifyResponse;
      setResp(data);
      if (!data.ok && !data.message) {
        setError("検証に失敗しました。（サーバ側でエラー）");
      }
    } catch (e) {
      console.error(e);
      setError("ネットワークエラーです。もう一度ためして。");
    } finally {
      setLoading(false);
    }
  }

  function badgeColor(result?: Result) {
    switch (result) {
      case "SAFE":
        return "#22c55e";
      case "WARNING":
        return "#eab308";
      case "DANGER":
        return "#ef4444";
      default:
        return "#64748b";
    }
  }

  return (
    <main style={{ padding: "24px", maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>LUMI CIA Center</h1>
      <p style={{ marginBottom: 24, opacity: 0.8 }}>
        行動ログ・改ざん検証・本人確認（KYC）をまとめて扱う「監査ビュー」レイヤーです。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 24, marginBottom: 12 }}>改ざん検証（Verify）</h2>
        <p style={{ marginBottom: 8, fontSize: 14, opacity: 0.8 }}>
          ここに CIA JSON を貼り付けて検証します。β版・テスト専用です。
        </p>

        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder='ここに CIA JSON をペースト'
          style={{
            width: "100%",
            minHeight: 200,
            padding: 12,
            borderRadius: 8,
            border: "1px solid #1f2937",
            background: "#020617",
            color: "#e5e7eb",
            fontFamily: "monospace",
            fontSize: 12,
            marginBottom: 12,
          }}
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            border: "none",
            background: loading ? "#4b5563" : "#3b82f6",
            color: "white",
            fontWeight: 600,
            cursor: loading ? "default" : "pointer",
          }}
        >
          {loading ? "検証中..." : "検証する"}
        </button>

        {error && (
          <p style={{ marginTop: 12, color: "#f97316", fontSize: 13 }}>{error}</p>
        )}

        {resp && (
          <div
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 12,
              background: "#020617",
              border: "1px solid #1f2937",
            }}
          >
            <div style={{ marginBottom: 8, fontSize: 13, opacity: 0.8 }}>
              検証結果
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 10px",
                borderRadius: 999,
                background: badgeColor(resp.result),
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: "#0b1120" }}>
                {resp.result ?? "UNKNOWN"}
              </span>
            </div>
            {resp.message && (
              <p style={{ marginTop: 8, fontSize: 13, opacity: 0.9 }}>
                {resp.message}
              </p>
            )}
          </div>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: 24, marginBottom: 12 }}>
          KYC ステータス（TrastDock）
        </h2>
        <p style={{ fontSize: 14, opacity: 0.8 }}>
          現在、KYC / CIA 連携モジュールは準備中です。
          <br />
          β版では「CIA レポート改ざん検証ツール」のみを提供しています。
        </p>
      </section>
    </main>
  );
}
