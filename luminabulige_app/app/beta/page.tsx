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
    <main>
      <div>
        SAFE:{sum.safe} / WARNING:{sum.warning} / DANGER:{sum.danger}（記録:{sum.total}）
      </div>

      <ul>
        {logs.map((l) => (
          <li key={l.date}>
            {l.date} / {l.level} / {l.diffYen.toLocaleString()}円
          </li>
        ))}
      </ul>
    </main>
  );
}
