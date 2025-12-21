"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { last30, loadDailyLogs, summarize, type DailyLog } from "../lib/lumiStorage";

export default function BetaPage() {
  const [logs, setLogs] = useState<DailyLog[]>([]);

  useEffect(() => {
    setLogs(loadDailyLogs());
  }, []);

  const recent = useMemo(() => last30(logs), [logs]);
  const sum = useMemo(() => summarize(recent), [recent]);

  return (
    <main style={{ padding: 24, maxWidth: 760, margin: "0 auto", lineHeight: 1.6 }}>
      <h1 style={{ marginBottom: 8 }}>30日ログ（β）</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Compareで「今日のログとして保存」を押すと、ここに集計が反映されます。
      </p>

      <section style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12, marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>30日のまとめ（直近30日）</h2>
        <p style={{ margin: 0 }}>
          SAFE：<b>{sum.safe}</b> 日 / WARNING：<b>{sum.warning}</b> 日 / DANGER：<b>{sum.danger}</b> 日（記録：{sum.total} 日）
        </p>
      </section>

      <section style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12, marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>ログ一覧</h2>
        {recent.length === 0 ? (
          <p style={{ margin: 0, opacity: 0.8 }}>まだ記録がありません。まず Compare で「今日のログとして保存」。</p>
        ) : (
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            {recent.map((x) => (
              <li key={x.date} style={{ marginBottom: 10 }}>
                <b>{x.date}</b> / {x.level} / 差分：{x.diffYen.toLocaleString()}円
              </li>
            ))}
          </ul>
        )}
      </section>

      <div style={{ marginTop: 18 }}>
        <Link href="/compare">Compareへ戻る</Link>
      </div>
    </main>
  );
}
