"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DailyLog, loadDailyLogs, last30, summarize } from "../lib/lumiStorage";

export default function BetaPage() {
  const [logs, setLogs] = useState<DailyLog[]>([]);

  useEffect(() => {
    const all = loadDailyLogs();
    const recent = last30(all); // 直近30日 + 日付降順（lumiStorage側の仕様）
    setLogs(recent);
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
          <span className="badge badge-safe">勝ち越し：{summary.safe}日</span>
          <span className="badge badge-warning">引き分け：{summary.warning}日</span>
          <span className="badge badge-danger">反省日：{summary.danger}日</span>
        </div>

        <p className="muted">
          SAFE：{summary.safe}日 / WARNING：{summary.warning}日 / DANGER：{summary.danger}日（記録：{summary.total}日）
        </p>
      </section>

      <section className="card">
        <h2 className="cardTitle">ログ一覧</h2>

        {logs.length === 0 ? (
          <p className="muted">まだ記録がありません。Compareで保存してみてください。</p>
        ) : (
          <ul className="logList">
            {logs.map((log) => (
              <li key={`${log.date}-${log.diffYen}-${log.level}`} className="logItem">
                <span className="logDate">{log.date}</span>
                <span className={`pill pill-${log.level.toLowerCase()}`}>{log.level}</span>
                <span className="logDiff">
                  差分：{log.diffYen.toLocaleString()}円
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="actions">
  <Link className="link" href="/compare">Compareへ戻る</Link>
  <a className="link" href="https://luminabulige.com/">LPへ戻る</a>
</div>
      </section>
    </main>
  );
}
