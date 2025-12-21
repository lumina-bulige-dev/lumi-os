"use client";

import { useEffect, useMemo, useState } from "react";
import { loadDailyLogs, last30, summarize } from "../lib/lumiStorage";

export default function BetaPage() {
  const [logs, setLogs] = useState<ReturnType<typeof loadDailyLogs>>([]);

  useEffect(() => {
    const all = loadDailyLogs();
    setLogs(last30(all));
  }, []);

  const summary = useMemo(() => summarize(logs), [logs]);

  return (
    <main className="page">
      <header className="hero">
        <h1 className="title">30日ログ（β）</h1>
        <p className="lead">
          Compareで「今日のログとして保存」を押すと、ここに集計が反映されます。
        </p>
      </header>

      <section className="card">
        <h2 className="cardTitle">30日のまとめ（直近30日）</h2>

        <div className="badges">
          <span className="badge badge-safe">SAFE：{summary.safe}日</span>
          <span className="badge badge-warning">WARNING：{summary.warning}日</span>
          <span className="badge badge-danger">DANGER：{summary.danger}日</span>
        </div>

        <p className="muted">
          SAFE：{summary.safe}日 / WARNING：{summary.warning}日 / DANGER：{summary.danger}日（記録：{summary.total}日）
        </p>
      </section>

      <section className="card">
        <h2 className="cardTitle">ログ一覧</h2>

        <ul className="logList">
          {logs.map((log) => (
            <li key={log.date} className="logItem">
              <span className="logDate">{log.date}</span>

              <span
                className={[
                  "pill",
                  log.level === "SAFE" ? "pill-safe" : "",
                  log.level === "WARNING" ? "pill-warning" : "",
                  log.level === "DANGER" ? "pill-danger" : "",
                ].join(" ")}
              >
                {log.level}
              </span>

              <span className="logDiff">差分：{log.diffYen.toLocaleString()}円</span>
            </li>
          ))}
        </ul>

        <div className="actions">
          <a className="link" href="/compare">Compareへ戻る</a>
        </div>
      </section>
    </main>
  );
}
