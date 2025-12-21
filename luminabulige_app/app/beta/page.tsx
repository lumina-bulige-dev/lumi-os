"use client";

import { useEffect, useMemo, useState } from "react";
import { loadDailyLogs, last30, summarize, type DailyLog } from "../lib/lumiStorage";

export default function BetaPage() {
  const [logs, setLogs] = useState<DailyLog[]>([]);

  useEffect(() => {
    const all = loadDailyLogs();
    const viewLogs = last30(all);
    setLogs(viewLogs);
  }, []);

  const sum = useMemo(() => summarize(logs), [logs]);

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 34, marginBottom: 8 }}>30日ログ（β）</h1>

      <div style={{ opacity: 0.9, marginBottom: 16 }}>
        SAFE:{sum.safe} / WARNING:{sum.warning} / DANGER:{sum.danger}（記録:{sum.total}）
      </div>

      <div style={{ marginBottom: 12 }}>
        <a href="/compare">Compareへ戻る</a>
      </div>

      <h2 style={{ marginTop: 24 }}>ログ一覧</h2>

      {logs.length === 0 ? (
        <div style={{ opacity: 0.75 }}>まだ記録がありません（Compareで保存してください）</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 10 }}>
          {logs.map((l) => (
            <li
              key={l.date}
              style={{
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 14,
                padding: 12,
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <span style={{ opacity: 0.9 }}>{l.date}</span>
              <span style={{ fontWeight: 800 }}>{l.level}</span>
              <span style={{ opacity: 0.9 }}>{l.diffYen.toLocaleString()}円</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
