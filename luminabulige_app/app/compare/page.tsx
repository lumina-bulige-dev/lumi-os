"use client";

import { useEffect, useMemo, useState } from "react";
import { calcLevel } from "../lib/lumiRules";
import { loadCompare, saveCompare, upsertTodayLog } from "../lib/lumiStorage";

export default function ComparePage() {
  const [balance, setBalance] = useState<number>(0);
  const [floor, setFloor] = useState<number>(0);
  const [savedMsg, setSavedMsg] = useState<string>("");

  // 初回：保存値を復元（旧キーも吸い上げて新キーへ寄せる）
  useEffect(() => {
    const v = loadCompare();
    setBalance(v.balance);
    setFloor(v.floor);
  }, []);

  // 変更時：保存（新キーに統一）
  useEffect(() => {
    saveCompare(balance, floor);
  }, [balance, floor]);

  const level = useMemo(() => calcLevel(balance, floor), [balance, floor]);
  const diff = useMemo(() => balance - floor, [balance, floor]);

  function saveToday() {
    const entry = upsertTodayLog(balance, floor);
    setSavedMsg(`今日のログ保存OK：${entry.date} / ${entry.level}`);
    setTimeout(() => setSavedMsg(""), 2500);
  }

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 40, marginBottom: 8 }}>Compare</h1>
      <p style={{ opacity: 0.8, marginBottom: 24 }}>
        入力した数字で、今日の安全度を即計算します（端末に保存）。
      </p>

      <section style={{ display: "grid", gap: 12, marginBottom: 20 }}>
        <label>
          残高（円）
          <input
            type="number"
            value={balance}
            onChange={(e) => setBalance(Number(e.target.value))}
            style={{ width: "100%", padding: 12, fontSize: 16, marginTop: 6 }}
            placeholder="例: 123456"
          />
        </label>

        <label>
          Floor（絶対割れない下限・円）
          <input
            type="number"
            value={floor}
            onChange={(e) => setFloor(Number(e.target.value))}
            style={{ width: "100%", padding: 12, fontSize: 16, marginTop: 6 }}
            placeholder="例: 100000"
          />
        </label>

        <button
          onClick={saveToday}
          style={{
            padding: "10px 14px",
            fontSize: 16,
            cursor: "pointer",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "#fff",
          }}
        >
          今日のログとして保存（30日ログ）
        </button>

        {savedMsg ? <div style={{ opacity: 0.8 }}>{savedMsg}</div> : null}
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

      <p style={{ marginTop: 18, opacity: 0.7 }}>
        ※Wise/銀行連携はまだ無し。ここで“数字が動く”状態を先に固める。
      </p>
    </main>
  );
}
