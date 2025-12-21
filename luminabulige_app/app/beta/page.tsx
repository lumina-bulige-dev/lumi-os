"use client";

import { useEffect, useMemo, useState } from "react";
import { loadLogs } from "../lib/lumiStorage"; // あなたの実体に合わせて
// import { LumiLogV1 } ... あるなら型も使ってOK
import { loadDailyLogs, last30, summarize } from "../lib/lumiStorage";

export default function BetaPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const raw = loadLogs();
    // 直近30日だけ & 日付降順（既存ロジックに合わせて）
    const recent = raw
      .filter((l: any) => isWithinLast30Days(l.date))
      .sort((a: any, b: any) => (a.date < b.date ? 1 : -1));
    setLogs(recent);
  }, []);

  const summary = useMemo(() => {
    let safe = 0, warning = 0, danger = 0;
    for (const log of logs) {
      if (log.level === "SAFE") safe++;
      if (log.level === "WARNING") warning++;
      if (log.level === "DANGER") danger++;
    }
    return { safe, warning, danger, total: logs.length };
  }, [logs]);

  const shareText = useMemo(() => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    return [
      "LUMI 30日ログ（β）",
      `SAFE:${summary.safe} / WARNING:${summary.warning} / DANGER:${summary.danger}（記録:${summary.total}日）`,
      url,
    ].join("\n");
  }, [summary]);

  async function onShare() {
    // iOS: ユーザー操作(クリック)の中で呼ぶのが必須
    try {
      const url = window.location.href;

      if (navigator.share) {
        await navigator.share({
          title: "LUMI 30日ログ（β）",
          text: shareText,
          url,
        });
        return;
      }

      // フォールバック：コピー
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        alert("シェア文をコピーしました。SNS/チャットに貼ってください。");
        return;
      }

      // 最終フォールバック
      prompt("コピーして共有してください", shareText);
    } catch (e) {
      // iOSは「キャンセル」でも例外扱いになることがあるので握りつぶしでOK
      // ただし本当に壊れてる時のためにログ残したいなら console.log(e)
    }
  }

  return (
    <main className="page">
      <div className="hero">
        <h1 className="title">30日ログ（β）</h1>
        <p className="lead">Compareで「今日のログとして保存」を押すと、ここに集計が反映されます。</p>
      </div>

      <section className="card">
        <h2 className="cardTitle">30日のまとめ（直近30日）</h2>
        <p className="muted">
          SAFE：{summary.safe} 日 / WARNING：{summary.warning} 日 / DANGER：{summary.danger} 日（記録：{summary.total} 日）
        </p>

        {/* ✅ ここがShare */}
        <div className="actions">
          <button className="btn-base" onClick={onShare}>
            シェアする
          </button>
          <p className="muted" style={{ marginTop: 10 }}>
            ※ 銀行ではありません／資金は預かりません／投資助言はしません
          </p>
        </div>
      </section>

      {/* 既存のログ一覧 */}
      <section className="card">
        <h2 className="cardTitle">ログ一覧</h2>
        <ul className="logList">
          {logs.map((log) => (
            <li key={`${log.date}-${log.diff}-${log.level}`} className="logItem">
              <span className="logDate">{log.date}</span>
              <span className={`pill pill-${String(log.level).toLowerCase()}`}>{log.level}</span>
              <span className="logDiff">差分：{Number(log.diff).toLocaleString()}円</span>
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

function isWithinLast30Days(dateStr: string): boolean {
  const today = new Date();
  const target = new Date(dateStr + "T00:00:00");
  const diffMs = today.getTime() - target.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 30;
}
