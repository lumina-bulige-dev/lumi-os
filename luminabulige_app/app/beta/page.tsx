"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { LumiLogV1, loadLogs } from "./utils/logs"; // ここは既存のまま

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isWithinLast30Days(dateStr: string): boolean {
  const today = new Date();
  const target = new Date(dateStr + "T00:00:00");
  const diffMs = today.getTime() - target.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 30;
}

export default function Logs30Page() {
  const [logs, setLogs] = useState<LumiLogV1[]>([]);
  const todayStr = useMemo(() => todayISO(), []);
  const todayRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    const raw = loadLogs();
    const recent = raw
      .filter((l) => isWithinLast30Days(l.date))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    setLogs(recent);
  }, []);

  // ✅ 今日の行があれば自動でそこへスクロール（任意）
  useEffect(() => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [logs]);

  const summary = useMemo(() => {
    let safe = 0, warning = 0, danger = 0;
    for (const log of logs) {
      if (log.level === "SAFE") safe++;
      if (log.level === "WARNING") warning++;
      if (log.level === "DANGER") danger++;
    }
    return { safe, warning, danger, total: logs.length };
  }, [logs]);

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1>30日ログ（β）</h1>

      <section style={{ marginBottom: 16 }}>
        <h2>30日のまとめ（直近30日）</h2>
        <p>
          SAFE：{summary.safe} 日 / WARNING：{summary.warning} 日 / DANGER：{summary.danger} 日
          （記録：{summary.total} 日）
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="link" href="/compare">Compareへ戻る</Link>
          <a className="link" href="https://luminabulige.com/">LPへ戻る</a>
        </div>
      </section>

      <section>
        <h2>ログ一覧</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
          {logs.map((log) => {
            const isToday = log.date === todayStr;

            // 今日の行だけref付与（見つかったらスクロール）
            const ref = isToday ? todayRef : undefined;

            return (
              <li
                key={`${log.date}-${log.diff}-${log.level}`}
                ref={ref as any}
                className={`log-item ${isToday ? "log-item--today" : ""}`}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <b>{log.date}</b>
                    {isToday ? <span className="pill pill-today">TODAY</span> : null}
                  </div>

                  <span
                    className={`badge ${
                      log.level === "SAFE"
                        ? "badge-safe"
                        : log.level === "WARNING"
                        ? "badge-warning"
                        : "badge-danger"
                    }`}
                  >
                    {log.level}
                  </span>
                </div>

                <div style={{ opacity: 0.9, marginTop: 6 }}>
                  差分：<b>{Number(log.diff).toLocaleString()}円</b>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
