"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { loadDailyLogs, last30, summarize, type DailyLog } from "../lib/lumiStorage";

function getLast30Range() {
  const today = new Date();
  const to = today.toISOString().slice(0, 10);
  const fromDate = new Date(today);
  fromDate.setDate(today.getDate() - 29);
  const from = fromDate.toISOString().slice(0, 10);
  return { from, to };
}

export default function BetaPage() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const all = loadDailyLogs();
    const viewLogs = last30(all);
    setLogs(viewLogs);
  }, []);

  const sum = useMemo(() => summarize(logs), [logs]);
  const range = useMemo(() => getLast30Range(), []);

  const onShare = useCallback(async () => {
    if (isSharing) return;
    setIsSharing(true);

    try {
      const url = window.location.href;
      const latest = logs[0];
      const latestLine = latest
        ? `最新: ${latest.date} / ${latest.level} / ${Number(latest.diffYen).toLocaleString()}円`
        : "最新: まだ記録なし";

      const text =
        `LUMI 30日ログ（β）\n` +
        `期間: ${range.from}〜${range.to}\n` +
        `SAFE:${sum.safe} / WARNING:${sum.warning} / DANGER:${sum.danger}（記録:${sum.total}）\n` +
        `${latestLine}\n` +
        `URL: ${url}\n\n` +
        `※ 銀行ではありません／資金は預かりません／投資助言はしません`;

      // 1) iPhone共有シート（最優先）
      try {
        if (navigator.share) {
          await navigator.share({ title: "LUMI 30日ログ（β）", text, url });
          return;
        }
      } catch {
        // ユーザーキャンセル等は握りつぶしでOK
      }

      // 2) クリップボード
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          alert("シェア文をコピーしました。SNS/チャットに貼ってください。");
          return;
        }
      } catch {}

      // 3) 最終フォールバック（手動コピー）
      prompt("コピーして共有してください", text);
    } finally {
      setTimeout(() => setIsSharing(false), 400);
    }
  }, [isSharing, logs, range.from, range.to, sum.safe, sum.warning, sum.danger, sum.total]);

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
            <button className="btn" type="button" onClick={onShare}>
              {isSharing ? "共有を起動中…" : "シェアする"}
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
