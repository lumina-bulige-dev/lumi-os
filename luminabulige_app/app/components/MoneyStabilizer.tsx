"use client";
import React, { useEffect, useMemo, useState } from "react";

type ParentKey = "FIXED" | "LIFE" | "WORK" | "FUN" | "OTHER";
type LogKind = "INCOME" | "EXPENSE";
type PlaceTag = "home" | "work" | "move" | "other";

type LogItem = {
  id: string;
  occurredAt: number;
  createdAt: number;
  kind: LogKind;
  parent: ParentKey;
  child: string;
  amount: number; // 常に正数（kindで符号扱い）
  memo?: string;
  placeTag?: PlaceTag;
};

const STORAGE_KEY = "lumi_compare_v2";

const CHILDREN: Record<ParentKey, string[]> = {
  FIXED: ["家賃", "通信", "サブスク", "保険", "ローン", "税金", "光熱費", "その他固定費"],
  LIFE: ["食費", "日用品", "交通", "医療", "衣類", "交際", "その他生活"],
  WORK: ["ツール", "学習", "移動", "備品", "投資(自己)", "その他仕事"],
  FUN: ["娯楽", "外食", "趣味", "旅行", "ゲーム", "ギャンブル(注意)", "その他FUN"],
  OTHER: ["立替", "返金", "寄付", "不明", "その他"],
};

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function toDatetimeLocal(ms: number) {
  const d = new Date(ms);
  const offset = d.getTimezoneOffset() * 60_000;
  return new Date(ms - offset).toISOString().slice(0, 16);
}

function fromDatetimeLocal(value: string) {
  const d = new Date(value);
  const ms = d.getTime();
  return Number.isFinite(ms) ? ms : Date.now();
}

function formatJPY(n: number) {
  return n.toLocaleString("ja-JP", { maximumFractionDigits: 0 });
}

export default function MoneyStabilizer() {
  // ====== state ======
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [kind, setKind] = useState<LogKind>("EXPENSE");
  const [parent, setParent] = useState<ParentKey>("LIFE");
  const [child, setChild] = useState<string>(CHILDREN.LIFE[0]);
  const [amount, setAmount] = useState<string>("");
  const [memo, setMemo] = useState<string>("");
  const [placeTag, setPlaceTag] = useState<PlaceTag>("home");
  const [occurredAtInput, setOccurredAtInput] = useState<string>(() =>
    toDatetimeLocal(Date.now())
  );

  // 親カテゴリ変更 → 子カテゴリ追従
  useEffect(() => {
    setChild(CHILDREN[parent]?.[0] ?? "その他");
  }, [parent]);

  // Load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        if (typeof parsed.openingBalance === "number") {
          setOpeningBalance(parsed.openingBalance);
        }
        if (Array.isArray(parsed.logs)) {
          setLogs(parsed.logs);
        }
      }
    } catch {
      // 失敗は無視（β）
    }
  }, []);

  // Save
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ openingBalance, logs }));
    } catch {
      // storage一杯などは無視
    }
  }, [openingBalance, logs]);



const PARENTS: ParentKey[] = ["FIXED", "LIFE", "WORK", "FUN", "OTHER"];
const PLACES: PlaceTag[] = ["home", "work", "move", "other"];

function toMs(ts: any): number {
  const n = Number(ts);
  if (!Number.isFinite(n)) return Date.now();
  // 10桁(秒)っぽいならmsへ
  return n < 1e12 ? n * 1000 : n;
}

function safeParent(v: any): ParentKey {
  return PARENTS.includes(v) ? v : "OTHER";
}

function safePlace(v: any): PlaceTag {
  return PLACES.includes(v) ? v : "other";
}

function safeKind(v: any): LogKind {
  return v === "INCOME" ? "INCOME" : "EXPENSE";
}


  
  function addLog() {
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return;

    const now = Date.now();
    const occurredAt = fromDatetimeLocal(occurredAtInput);

    const item: LogItem = {
      id: uuid(),
      createdAt: now,
      occurredAt,
      kind,
      parent,
      child,
      amount: Math.round(amt),
      memo: memo.trim() ? memo.trim() : undefined,
      placeTag,
    };

    setLogs((prev) =>
      [item, ...prev].sort((a, b) => b.occurredAt - a.occurredAt)
    );
    setAmount("");
    setMemo("");
  }

  // ✅ 累積支出の時系列（折れ線グラフの元データ）
  const expenseSeries = useMemo(() => {
    const sorted = [...logs].sort((a, b) => a.occurredAt - b.occurredAt);

    let cumExpense = 0;
    const points: { ts: number; v: number }[] = [];

    for (const x of sorted) {
      if (x.kind === "EXPENSE") cumExpense += x.amount;
      points.push({ ts: x.occurredAt, v: cumExpense });
    }

    if (points.length === 0) {
      points.push({ ts: Date.now(), v: 0 });
    }

    return points;
  }, [logs]);

    const expensePath = useMemo(() => {
    if (!expenseSeries.length) return "";

    const xs = expenseSeries.map((p) => p.ts);
    const ys = expenseSeries.map((p) => p.v);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = 0;
    const maxY = Math.max(...ys);

    const width = 300;
    const height = 80;

    const points = expenseSeries.map((p) => {
      const x =
        maxX === minX ? 0 : ((p.ts - minX) / (maxX - minX || 1)) * width;
      const y =
        maxY === minY
          ? height
          : height - ((p.v - minY) / (maxY - minY || 1)) * height;
      return { x, y };
    });

    return points
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
      .join(" ");
  }, [expenseSeries]);
  // 残高・合計
  const summary = useMemo(() => {
    const incomesTotal = logs
      .filter((x) => x.kind === "INCOME")
      .reduce((s, x) => s + x.amount, 0);
    const expensesTotal = logs
      .filter((x) => x.kind === "EXPENSE")
      .reduce((s, x) => s + x.amount, 0);
    const balance = openingBalance + incomesTotal - expensesTotal;
    return { incomesTotal, expensesTotal, balance };
  }, [logs, openingBalance]);

  // ====== JSX（ここから下は必ずこの return の中）======
  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Compare / Money Stabilizer（β）</h1>
        <p className="text-slate-300 text-sm">
          開始残高 + 入金/支出ログで「床」を管理する。
        </p>
      </header>

           <section className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-sm text-slate-200 font-semibold">
            累積支出グラフ
          </div>
          <div className="text-xs text-slate-400">
            最新：¥{" "}
            {formatJPY(
              expenseSeries[expenseSeries.length - 1]?.v ?? 0
            )}
          </div>
        </div>

        <svg
          viewBox="0 0 300 80"
          className="w-full h-24"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* 床ライン（横線） */}
          <line
            x1="0"
            y1="79"
            x2="300"
            y2="79"
            stroke="rgba(148,163,184,0.4)"
            strokeWidth="0.5"
          />

          {expensePath && (
            <>
              {/* 下を塗るエリア */}
              <path
                d={`${expensePath} L300,80 L0,80 Z`}
                fill="url(#expenseFill)"
              />
              {/* 折れ線本体 */}
              <path
                d={expensePath}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
              />
            </>
          )}
        </svg>
      </section>

      {/* 入力・サマリ */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
        <label className="text-xs text-slate-300 block">
          開始残高（必須）
          <input
            className="mt-1 w-full rounded-lg bg-slate-950/60 border border-white/10 px-3 py-2"
            inputMode="numeric"
            value={openingBalance}
            onChange={(e) => setOpeningBalance(Number(e.target.value))}
          />
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setKind("EXPENSE")}
            className={`rounded-lg px-3 py-2 text-sm border ${
              kind === "EXPENSE"
                ? "bg-white text-slate-950"
                : "border-white/15 bg-white/5 text-slate-200"
            }`}
          >
            支出
          </button>
          <button
            type="button"
            onClick={() => setKind("INCOME")}
            className={`rounded-lg px-3 py-2 text-sm border ${
              kind === "INCOME"
                ? "bg-white text-slate-950"
                : "border-white/15 bg-white/5 text-slate-200"
            }`}
          >
            入金
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-5">
          <div className="md:col-span-1">
            <label className="text-xs text-slate-300">親カテゴリ</label>
            <select
              className="mt-1 w-full rounded-lg bg-slate-950/60 border border-white/10 px-3 py-2"
              value={parent}
              onChange={(e) => setParent(e.target.value as ParentKey)}
            >
              {(["FIXED", "LIFE", "WORK", "FUN", "OTHER"] as const).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-slate-300">子カテゴリ</label>
            <select
              className="mt-1 w-full rounded-lg bg-slate-950/60 border border-white/10 px-3 py-2"
              value={child}
              onChange={(e) => setChild(e.target.value)}
            >
              {CHILDREN[parent].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="text-xs text-slate-300">金額（JPY）</label>
            <input
              className="mt-1 w-full rounded-lg bg-slate-950/60 border border-white/10 px-3 py-2"
              placeholder="例：1200"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="md:col-span-1">
            <label className="text-xs text-slate-300">場所</label>
            <select
              className="mt-1 w-full rounded-lg bg-slate-950/60 border border-white/10 px-3 py-2"
              value={placeTag ?? "other"}
              onChange={(e) => setPlaceTag(e.target.value as any)}
            >
              <option value="home">home</option>
              <option value="work">work</option>
              <option value="move">move</option>
              <option value="other">other</option>
            </select>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-5 items-end">
          <div className="md:col-span-2">
            <label className="text-xs text-slate-300">発生時刻</label>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-lg bg-slate-950/60 border border-white/10 px-3 py-2"
              value={occurredAtInput}
              onChange={(e) => setOccurredAtInput(e.target.value)}
            />
          </div>
          <div className="md:col-span-1">
            <button
              className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 hover:bg-white/15"
              onClick={() => setOccurredAtInput(toDatetimeLocal(Date.now()))}
              type="button"
            >
              今
            </button>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-slate-300">メモ（任意）</label>
            <input
              className="mt-1 w-full rounded-lg bg-slate-950/60 border border-white/10 px-3 py-2"
              placeholder="例：深夜テンションでコンビニ"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <button
            className="rounded-lg bg-white text-slate-950 px-4 py-2 font-semibold"
            onClick={addLog}
            type="button"
          >
            追加
          </button>
          <div className="ml-auto text-sm text-slate-200">
            残高：
            <span className="font-mono">¥ {formatJPY(summary.balance)}</span>
          </div>
        </div>

        {summary.balance < 0 && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200 mt-2">
            ⚠️ 残高がマイナスです（床が抜けました）。入金 or 開始残高を確認してね。
          </div>
        )}

        <div className="grid gap-2 md:grid-cols-3 text-sm mt-3">
          <div className="rounded-lg border border-white/10 bg-slate-950/40 p-3">
            <div className="text-xs text-slate-300">開始残高</div>
            <div className="font-semibold">¥ {formatJPY(openingBalance)}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-950/40 p-3">
            <div className="text-xs text-slate-300">入金合計</div>
            <div className="font-semibold">¥ {formatJPY(summary.incomesTotal)}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-950/40 p-3">
            <div className="text-xs text-slate-300">支出合計</div>
            <div className="font-semibold">¥ {formatJPY(summary.expensesTotal)}</div>
          </div>
        </div>
      </section>

      {/* ログ一覧 */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h2 className="font-semibold mb-3">ログ</h2>
        {logs.length === 0 ? (
          <p className="text-slate-300 text-sm">
            まだログがない。まず1件、現実世界から拾ってこい🫳🌍
          </p>
        ) : (
          <div className="space-y-2">
            {logs.map((x) => (
              <div
                key={x.id}
                className="rounded-lg border border-white/10 bg-slate-950/40 p-3 flex items-center gap-3"
              >
                <div className="min-w-[100px] text-xs text-slate-300">
                  {x.kind}
                  <div className="text-slate-400">
                    {new Date(x.occurredAt).toLocaleString("ja-JP")}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold">
                    {x.parent} / {x.child}
                    {x.placeTag ? (
                      <span className="ml-2 text-xs text-slate-400">
                        ({x.placeTag})
                      </span>
                    ) : null}
                  </div>
                  {x.memo ? (
                    <div className="text-xs text-slate-300 mt-1">{x.memo}</div>
                  ) : null}
                </div>
                <div className="text-right">
                  <div className="font-bold">¥ {formatJPY(x.amount)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
