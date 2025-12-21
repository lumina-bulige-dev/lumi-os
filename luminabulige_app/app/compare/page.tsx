"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // ← 3) 用
import { calcLevel } from "../lib/lumiRules";
import { loadCompare, saveCompare, upsertTodayLog } from "../lib/lumiStorage";

export default function ComparePage() {
  const router = useRouter();

  const [balance, setBalance] = useState<number>(0);
  const [floor, setFloor] = useState<number>(0);
  const [savedMsg, setSavedMsg] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false); // ✅追加
  const tRef = useRef<number | null>(null); // ✅タイマー掃除用（安全）

  useEffect(() => {
    const v = loadCompare();
    setBalance(v.balance);
    setFloor(v.floor);
    return () => {
      if (tRef.current) window.clearTimeout(tRef.current);
    };
  }, []);

  useEffect(() => {
    saveCompare(balance, floor);
  }, [balance, floor]);

  const level = useMemo(() => calcLevel(balance, floor), [balance, floor]);
  const diff = useMemo(() => balance - floor, [balance, floor]);

  // 入力が0/未設定のときは保存させない（事故防止）
  const canSave = useMemo(() => balance > 0 && floor > 0, [balance, floor]);

  const saveBtn = useMemo(() => {
    const base = isSaving ? "btn-base" : "btn-base"; // クラスは同じでOK（disabledで見た目変える）
    if (!canSave) return { label: "数字を入れてください", className: base };

    switch (level) {
      case "SAFE":
        return { label: isSaving ? "保存中…" : "今日のログとして保存（SAFE）", className: `${base} btn-safe` };
      case "WARNING":
        return { label: isSaving ? "保存中…" : "少し注意しながら保存（WARNING）", className: `${base} btn-warning` };
      case "DANGER":
        return { label: isSaving ? "保存中…" : "要注意ログとして保存（DANGER）", className: `${base} btn-danger` };
      default:
        return { label: isSaving ? "保存中…" : "今日のログとして保存", className: base };
    }
  }, [level, isSaving, canSave]);

  function saveToday() {
  if (!canSave) return;
  if (isSaving) return;

  setIsSaving(true);

  try {
    const entry = upsertTodayLog(balance, floor);
    setSavedMsg(`今日のログ保存OK：${entry.date} / ${entry.level}`);

    tRef.current = window.setTimeout(() => {
      router.push("/beta");
    }, 555);
  } finally {
    window.setTimeout(() => setIsSaving(false), 700);
  }
}

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 40, marginBottom: 8 }}>Compare</h1>

      <section style={{ display: "grid", gap: 12, marginBottom: 20 }}>
        <label>
          残高（円）
          <input
            type="number"
            value={balance}
            onChange={(e) => setBalance(Number(e.target.value))}
            style={{ width: "100%", padding: 12, fontSize: 16, marginTop: 6 }}
          />
        </label>

        <label>
          Floor（絶対割れない下限・円）
          <input
            type="number"
            value={floor}
            onChange={(e) => setFloor(Number(e.target.value))}
            style={{ width: "100%", padding: 12, fontSize: 16, marginTop: 6 }}
          />
        </label>

        <button
          onClick={saveToday}
          className={saveBtn.className}
          disabled={!canSave || isSaving} // ✅無効化
        >
          {saveBtn.label}
        </button>

        {savedMsg ? <div style={{ opacity: 0.8 }}>{savedMsg}</div> : null}

        {/* 3) 導線 */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/beta" className="link">30日ログを見る</Link>
          <a href="https://luminabulige.com/" className="link">LPへ戻る</a>
        </div>
      </section>

      <section style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>判定</h2>
        <p style={{ fontSize: 22, margin: "8px 0" }}>
          今日の安全度：<b>{level}</b>
        </p>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Floorとの差分：<b>{diff.toLocaleString()}円</b>
        </p>
      </section>
    </main>
  );
}
