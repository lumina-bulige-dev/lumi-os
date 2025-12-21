"use client";

import { useEffect, useMemo, useState } from "react";
import { loadDailyLogs, last30, summarize } from "../lib/lumiStorage";

export default function BetaPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    setLogs(last30(loadDailyLogs()));
  }, []);

  const sum = useMemo(() => summarize(logs), [logs]);

  return (
    <main className="beta">
      <div className="page">
        <h1 className="h1">30日ログ（β）</h1>
        <div className="lead">
          Compareで「今日のログとして保存」を押すと、ここに集計が反映されます。
        </div>

        <div className="card">
          <div className="summary-title">30日のまとめ（直近30日）</div>

          <div className="pill-row">
            <div className="pill safe">SAFE : {sum.safe}日</div>
            <div className="pill warn">WARNING : {sum.warning}日</div>
            <div className="pill danger">DANGER : {sum.danger}日</div>
          </div>

          <div className="note">
            SAFE:{sum.safe} / WARNING:{sum.warning} / DANGER:{sum.danger}（記録:{sum.total}）
          </div>

          <div style={{ marginTop: 12 }}>
            <button className="btn" type="button">
              シェアする（準備中）
            </button>
          </div>

          <div className="note">
            ※ 銀行ではありません／資金は預かりません／投資助言はしません
          </div>
        </div>

        <div className="card">
          <div className="summary-title">ログ一覧</div>
          <ul>
            {logs.map((l) => (
              <li key={l.date}>
                {l.date} / {l.level} / {Number(l.diffYen).toLocaleString()}円
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 14 }}>
            <a href="/compare">Compareへ戻る</a>
          </div>
        </div>
      </div>
    </main>
  );
}
