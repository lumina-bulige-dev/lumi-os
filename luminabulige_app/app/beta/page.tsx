"use client";

import { useEffect, useMemo, useState } from "react";
import { loadDailyLogs, last30, summarize } from "../lib/lumiStorage";

export default function BetaPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const viewLogs = last30(loadDailyLogs());
    setLogs(viewLogs);
  }, []);

  const sum = useMemo(() => summarize(logs), [logs]);

  return (
    <main className="page">
      <h1 className="h1">30日ログ（β）</h1>

      <div className="card">
        <div className="summary">30日のまとめ（直近30日）</div>
        <div className="sub">
          SAFE:{sum.safe} / WARNING:{sum.warning} / DANGER:{sum.danger}（記録:{sum.total}）
        </div>

        <button className="btn" type="button" id="share-btn">
          シェアする
        </button>
        <div className="note">※ 銀行ではありません／資金は預かりません／投資助言はしません</div>
      </div>

      <div className="card">
        <div className="summary">ログ一覧</div>
        <ul>
          {logs.map((l) => (
            <li key={l.date}>
              {l.date} / {l.level} / {Number(l.diffYen).toLocaleString()}円
            </li>
          ))}
        </ul>

        <a href="/compare" className="link">Compareへ戻る</a>
      </div>
    </main>
  );
}
