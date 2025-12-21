"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Safety = "SAFE" | "WARNING" | "DANGER";

type DailyLog = {
  date: string;          // "YYYY-MM-DD"
  balanceYen: number;    // 残高
  floorYen: number;      // Floor
  safety: Safety;        // 判定
  diffYen: number;       // balance - floor
  memo?: string;         // 任意メモ
};

const STORAGE_KEY = "lumi:dailyLogs:v1";

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function calcSafety(balanceYen: number, floorYen: number): { safety: Safety; diffYen: number } {
  const diffYen = balanceYen - floorYen;
  if (diffYen <= 0) return { safety: "DANGER", diffYen };
  // ここはルール好みで調整OK：Floor超えが小さい日はWARNINGなど
  if (diffYen < 30000) return { safety: "WARNING", diffYen };
  return { safety: "SAFE", diffYen };
}

function loadLogs(): DailyLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DailyLog[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveLogs(logs: DailyLog[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export default function BetaPage() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [balance, setBalance] = useState<number>(350000);
  const [floor, setFloor] = useState<number>(200000);
  const [memo, setMemo] = useState<string>("");

  useEffect(() => {
    setLogs(loadLogs());
  }, []);

  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [logs]);

  const last30 = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 29); // 今日含め30日
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    return sortedLogs.filter((x) => x.date >= cutoffStr);
  }, [sortedLogs]);

  const summary = useMemo(() => {
    const safe = last30.filter((x) => x.safety === "SAFE").length;
    const warning = last30.filter((x) => x.safety === "WARNING").length;
    const danger = last30.filter((x) => x.safety === "DANGER").length;
    return { safe, warning, danger, total: last30.length };
  }, [last30]);

  function upsertToday() {
    const date = todayISO();
    const { safety, diffYen } = calcSafety(balance, floor);

    const next: DailyLog = {
      date,
      balanceYen: balance,
      floorYen: floor,
      safety,
      diffYen,
      memo: memo?.trim() ? memo.trim() : undefined,
    };

    const withoutToday = logs.filter((x) => x.date !== date);
    const updated = [next, ...withoutToday];

    setLogs(updated);
    saveLogs(updated);
    setMemo("");
  }

  function clearAll() {
    if (!confirm("端末保存の30日ログを全削除します。OK？")) return;
    setLogs([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <main style={{ padding: 24, maxWidth: 760, margin: "0 auto", lineHeight: 1.6 }}>
      <h1 style={{ marginBottom: 8 }}>30日ログ（β）</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Wise/銀行連携はまだ無し。まずは「数字が動く状態」を端末保存で固定する。
      </p>

      <section style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12, marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>今日の入力</h2>

        <label style={{ display: "block", marginBottom: 8 }}>
          残高（円）
          <input
            type="number"
            value={balance}
            onChange={(e) => setBalance(Number(e.target.value))}
            style={{ width: "100%", padding: 12, fontSize: 16, marginTop: 6 }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          Floor（絶対割れない下限・円）
          <input
            type="number"
            value={floor}
            onChange={(e) => setFloor(Number(e.target.value))}
            style={{ width: "100%", padding: 12, fontSize: 16, marginTop: 6 }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 12 }}>
          メモ（任意）
          <input
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="例）今日は外食を回避できた、など"
            style={{ width: "100%", padding: 12, fontSize: 16, marginTop: 6 }}
          />
        </label>

        <button
          onClick={upsertToday}
          style={{ padding: "10px 14px", fontSize: 16, cursor: "pointer" }}
        >
          今日のログを保存
        </button>
      </section>

      <section style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12, marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>30日のまとめ（直近30日）</h2>
        <p style={{ margin: 0 }}>
          SAFE：<b>{summary.safe}</b> 日 / WARNING：<b>{summary.warning}</b> 日 / DANGER：<b>{summary.danger}</b> 日
          {" "}（記録：{summary.total} 日）
        </p>
        <p style={{ marginTop: 10, opacity: 0.85 }}>
          ※ “勝ち越し/引き分け/反省日” のラベル表現に寄せたいなら、ここをあなたの定義で置き換えるだけ。
        </p>
      </section>

      <section style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12, marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>ログ一覧</h2>
        {last30.length === 0 ? (
          <p style={{ margin: 0, opacity: 0.8 }}>まだ記録がありません。まず今日を保存。</p>
        ) : (
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            {last30.map((x) => (
              <li key={x.date} style={{ marginBottom: 10 }}>
                <b>{x.date}</b> / {x.safety} / Floor差分：{x.diffYen.toLocaleString()}円
                {x.memo ? <div style={{ opacity: 0.85 }}>メモ：{x.memo}</div> : null}
              </li>
            ))}
          </ul>
        )}

        <div style={{ marginTop: 12 }}>
          <button onClick={clearAll} style={{ padding: "8px 12px", cursor: "pointer" }}>
            端末保存ログを全削除
          </button>
        </div>
      </section>

      <div style={{ marginTop: 18 }}>
        <Link href="/compare">今すぐ比較する</Link>
      </div>
    </main>
  );
}
