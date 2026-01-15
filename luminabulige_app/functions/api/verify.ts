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
