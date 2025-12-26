"use client";

import React, { useEffect, useMemo, useState } from "react";

type ParentKey =
  | "FIXED"
  | "LIFE"
  | "MOVE"
  | "WORK"
  | "HEALTH"
  | "FUN"
  | "LEARN"
  | "DEBT"
  | "TRANSFER"
  | "OTHER";

type ChildKey = string;

type LogItem = {
  id: string;
  date: string; // YYYY-MM-DD
  parent: ParentKey;
  child: ChildKey;
  amount: number; // JPY
  memo?: string;
  createdAt: number;
};

const STORAGE_KEY = "lumi.moneyStabilizer.v1";
const DRAFT_KEY = "lumi.moneyStabilizer.draft.v1";

const CATEGORIES: Record<ParentKey, { label: string; children: { key: ChildKey; label: string }[] }> = {
  FIXED: {
    label: "固定費",
    children: [
      { key: "rent", label: "家賃/住居" },
      { key: "utilities", label: "光熱費" },
      { key: "net", label: "通信/ネット" },
      { key: "subs", label: "サブスク" },
      { key: "insurance", label: "保険" },
      { key: "tax", label: "税/公的" },
    ],
  },
  LIFE: {
    label: "生活",
    children: [
      { key: "groceries", label: "食料品" },
      { key: "daily", label: "日用品" },
      { key: "eatingout", label: "外食" },
      { key: "coffee", label: "カフェ/間食" },
    ],
  },
  MOVE: {
    label: "移動",
    children: [
      { key: "train", label: "電車/バス" },
      { key: "taxi", label: "タクシー" },
      { key: "gas", label: "ガソリン" },
      { key: "parking", label: "駐車/高速" },
    ],
  },
  WORK: {
    label: "仕事",
    children: [
      { key: "tools", label: "開発ツール/クラウド" },
      { key: "device", label: "デバイス/機材" },
      { key: "cowork", label: "作業場所" },
      { key: "client", label: "対外（打合せ等）" },
    ],
  },
  HEALTH: {
    label: "健康",
    children: [
      { key: "clinic", label: "病院/薬" },
      { key: "gym", label: "ジム/運動" },
      { key: "selfcare", label: "セルフケア" },
    ],
  },
  FUN: {
    label: "嗜好",
    children: [
      { key: "ent", label: "娯楽" },
      { key: "shopping", label: "衝動買い" },
      { key: "social", label: "交際" },
    ],
  },
  LEARN: {
    label: "学び",
    children: [
      { key: "books", label: "本/教材" },
      { key: "course", label: "講座" },
      { key: "conf", label: "イベント/カンファ" },
    ],
  },
  DEBT: {
    label: "返済",
    children: [
      { key: "loan", label: "ローン" },
      { key: "card", label: "カード返済" },
    ],
  },
  TRANSFER: {
    label: "移転",
    children: [
      { key: "toSavings", label: "貯蓄へ移す" },
      { key: "toWallet", label: "現金化/引出" },
      { key: "fx", label: "両替/送金" },
    ],
  },
  OTHER: {
    label: "その他",
    children: [{ key: "misc", label: "未分類" }],
  },
};

function todayYMD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function yen(n: number) {
  return new Intl.NumberFormat("ja-JP").format(Math.round(n));
}

export default function ComparePage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [date, setDate] = useState(todayYMD());
  const [parent, setParent] = useState<ParentKey>("LIFE");
  const [child, setChild] = useState<ChildKey>(CATEGORIES.LIFE.children[0].key);
  const [amount, setAmount] = useState<string>("");
  const [memo, setMemo] = useState<string>("");

  // load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLogs(JSON.parse(raw));
      const draftRaw = localStorage.getItem(DRAFT_KEY);
      if (draftRaw) {
        const d = JSON.parse(draftRaw);
        if (d.date) setDate(d.date);
        if (d.parent) setParent(d.parent);
        if (d.child) setChild(d.child);
        if (d.amount !== undefined) setAmount(String(d.amount ?? ""));
        if (d.memo !== undefined) setMemo(String(d.memo ?? ""));
      }
    } catch {}
  }, []);

  // autosave logs
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch {}
  }, [logs]);

  // autosave draft (入力途中の保険)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ date, parent, child, amount, memo })
        );
      } catch {}
    }, 250);
    return () => clearTimeout(t);
  }, [date, parent, child, amount, memo]);

  // parent changed -> child reset to first
  useEffect(() => {
    const first = CATEGORIES[parent].children[0]?.key ?? "misc";
    setChild(first);
  }, [parent]);

  const addLog = () => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return;

    const item: LogItem = {
      id: crypto.randomUUID(),
      date,
      parent,
      child,
      amount: n,
      memo: memo?.trim() ? memo.trim() : undefined,
      createdAt: Date.now(),
    };
    setLogs((prev) => [item, ...prev]);

    // “前回入力”の気持ちよさ：金額だけ空に戻す（カテゴリは保持）
    setAmount("");
  };

  const deleteLog = (id: string) => {
    setLogs((prev) => prev.filter((x) => x.id !== id));
  };

  const dayLogs = useMemo(() => logs.filter((x) => x.date === date), [logs, date]);

  const totals = useMemo(() => {
    const byParent: Record<string, number> = {};
    const byChild: Record<string, number> = {};
    let sum = 0;

    for (const x of dayLogs) {
      sum += x.amount;
      const p = x.parent;
      byParent[p] = (byParent[p] ?? 0) + x.amount;
      const ck = `${x.parent}:${x.child}`;
      byChild[ck] = (byChild[ck] ?? 0) + x.amount;
    }
    return { sum, byParent, byChild };
  }, [dayLogs]);

  // 超簡易 “スタビライザー” 指標（β）
  // 例：嗜好(FUN)比率が高いほど低下、学び(LEARN)・移転(TRANSFER toSavings)があると上昇
  const stabilizer = useMemo(() => {
    const sum = totals.sum || 1;
    const fun = totals.byParent["FUN"] ?? 0;
    const learn = totals.byParent["LEARN"] ?? 0;

    // 0〜100に寄せる雑な式（後で差し替え前提）
    let score = 70;
    score -= (fun / sum) * 60;
    score += (learn / sum) * 25;

    // “貯蓄へ移す”を検出したら加点
    const savingKey = "TRANSFER:toSavings";
    const toSavings = totals.byChild[savingKey] ?? 0;
    if (toSavings > 0) score += 10;

    score = Math.max(0, Math.min(100, score));
    return Math.round(score);
  }, [totals]);

  return (
    <main style={{ padding: 24, maxWidth: 920, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Money Stabilizer（β）</h1>
      <p style={{ opacity: 0.8, lineHeight: 1.7, marginBottom: 16 }}>
        親カテゴリ→子カテゴリでログを積む。入力は自動保存。日計/カテゴリ計も自動計算。
      </p>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr 1fr" }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 12, opacity: 0.8 }}>日付</span>
          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            type="date"
            style={inputStyle}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 12, opacity: 0.8 }}>親カテゴリ</span>
          <select value={parent} onChange={(e) => setParent(e.target.value as ParentKey)} style={inputStyle}>
            {Object.entries(CATEGORIES).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 12, opacity: 0.8 }}>子カテゴリ</span>
          <select value={child} onChange={(e) => setChild(e.target.value)} style={inputStyle}>
            {CATEGORIES[parent].children.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr auto", marginTop: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 12, opacity: 0.8 }}>金額（JPY）</span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="numeric"
            placeholder="例：1200"
            style={inputStyle}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 12, opacity: 0.8 }}>メモ（任意）</span>
          <input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="例：コンビニ、気分が落ちた" style={inputStyle} />
        </label>

        <button onClick={addLog} style={btnPrimary}>
          追加
        </button>
      </div>

      <div style={cardStyle}>
        <div style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>本日合計：¥{yen(totals.sum)}</div>
          <div style={{ opacity: 0.8 }}>Stabilizer：{stabilizer}/100</div>
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {Object.entries(totals.byParent)
            .sort((a, b) => b[1] - a[1])
            .map(([p, v]) => (
              <span key={p} style={pillStyle}>
                {CATEGORIES[p as ParentKey]?.label ?? p}：¥{yen(v)}
              </span>
            ))}
        </div>
      </div>

      <h2 style={{ fontSize: 18, marginTop: 18, marginBottom: 10 }}>今日のログ（{dayLogs.length}件）</h2>

      <div style={{ display: "grid", gap: 10 }}>
        {dayLogs.map((x) => (
          <div key={x.id} style={rowStyle}>
            <div style={{ display: "grid", gap: 2 }}>
              <div style={{ fontWeight: 700 }}>
                {CATEGORIES[x.parent].label} /{" "}
                {CATEGORIES[x.parent].children.find((c) => c.key === x.child)?.label ?? x.child}
              </div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{x.memo ?? "—"}</div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ fontVariantNumeric: "tabular-nums" }}>¥{yen(x.amount)}</div>
              <button onClick={() => deleteLog(x.id)} style={btnGhost}>
                削除
              </button>
            </div>
          </div>
        ))}
        {dayLogs.length === 0 && (
          <div style={{ opacity: 0.7 }}>まだログがありません。1件入れると全部が回り始める。</div>
        )}
      </div>

      <p style={{ marginTop: 18, fontSize: 12, opacity: 0.7, lineHeight: 1.7 }}>
        ※β: Stabilizerは暫定ロジック。将来「蒸発ポイント」「時間帯」「トリガー」等も入れて精度を上げる。
      </p>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "rgba(234,242,255,0.95)",
  outline: "none",
};

const cardStyle: React.CSSProperties = {
  marginTop: 14,
  padding: 14,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(0,0,0,0.25)",
};

const pillStyle: React.CSSProperties = {
  fontSize: 12,
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  padding: 12,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
};

const btnPrimary: React.CSSProperties = {
  alignSelf: "end",
  padding: "10px 14px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(70,182,255,0.18)",
  color: "rgba(234,242,255,0.96)",
  fontWeight: 800,
};

const btnGhost: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "transparent",
  color: "rgba(234,242,255,0.85)",
};
