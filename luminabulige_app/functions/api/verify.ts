"use client";

import React, { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";




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

type BadgeCSS = { color: string; background: string; border: string };

function badgeStyle(result: Result): BadgeCSS {
  // ui.color には ok / okBg / border だけ依存し、他はローカル定義に閉じる
  const palette: Record<Result, { color: string; bg: string; br: string }> = {
    OK:       { color: ui.color.ok, bg: ui.color.okBg,                br: "#A7F3D0" },
    NG:       { color: "#F97316",   bg: "rgba(251,146,60,0.16)",      br: "#FED7AA" },
    REVOKED:  { color: "#EF4444",   bg: "rgba(239,68,68,0.16)",       br: "#FECACA" },
    UNKNOWN:  { color: "#94A3B8",   bg: "rgba(148,163,184,0.16)",     br: ui.color.border },
  };

  const p = palette[result];
  return { color: p.color, background: p.bg, border: `1px solid ${p.br}` };
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
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fallback（古い環境用）
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
