"use client";

import { useEffect, useMemo, useState } from "react";
import { calcLevel } from "../lib/lumiRules";
import { loadCompare, saveCompare, upsertTodayLog } from "../lib/lumiStorage";

export default function ComparePage() {
  const [balance, setBalance] = useState<number>(0);
  const [floor, setFloor] = useState<number>(0);
  const [savedMsg, setSavedMsg] = useState<string>("");
const level = useMemo(() => calcLevel(balance, floor), [balance, floor]);
const diff = useMemo(() => balance - floor, [balance, floor]);

const saveBtn = useMemo(() => {
  switch (level) {
    case "SAFE":
      return { label: "今日のログとして保存（SAFE）", className: "btn-base btn-safe" };
    case "WARNING":
      return { label: "少し注意しながら保存（WARNING）", className: "btn-base btn-warning" };
    case "DANGER":
      return { label: "要注意ログとして保存（DANGER）", className: "btn-base btn-danger" };
    default:
      return { label: "今日のログとして保存", className: "btn-base" };
  }
}, [level]);
  
  useEffect(() => {
    const v = loadCompare();
    setBalance(v.balance);
    setFloor(v.floor);
  }, []);

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

        // 追加：レベルに応じたボタン表示を作る
<button onClick={saveToday} className={saveBtn.className}>
  {saveBtn.label}
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
