
"use client";

import { useEffect, useMemo, useState } from "react";

/** =========
 * Types
 * ========= */
type MoneyKind = "INCOME" | "EXPENSE";
type ParentKey = "FIXED" | "LIFE" | "WORK" | "FUN" | "OTHER" | "INCOME";

type LogItem = {
  id: string;
  occurredAt: number;
  createdAt: number;
  kind: MoneyKind;
  parent: ParentKey;
  child: string;
  amount: number; // 常に正の数（kindで意味を決める）
  memo?: string;
  placeTag?: "home" | "work" | "move" | "other";
};

const STORAGE_KEY = "lumi_compare_v2";

const CHILDREN: Record<ParentKey, string[]> = {
  INCOME: ["給料", "返金", "立替回収", "副収入", "その他入金"],

  FIXED: ["家賃", "通信", "サブスク", "保険", "ローン", "税金", "光熱費", "その他固定費"],
  LIFE: ["食費", "日用品", "交通", "医療", "衣類", "交際", "その他生活"],
  WORK: ["ツール", "学習", "移動", "備品", "投資(自己)", "その他仕事"],
  FUN: ["娯楽", "外食", "趣味", "旅行", "ゲーム", "ギャンブル(注意)", "その他FUN"],
  OTHER: ["立替", "寄付", "不明", "その他"],
};

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
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
function timeBucket(ts: number) {
  const h = new Date(ts).getHours();
  if (h >= 5 && h <= 10) return "朝";
  if (h >= 11 && h <= 16) return "昼";
  if (h >= 17 && h <= 22) return "夜";
  return "深夜";
}
function formatJPY(n: number) {
  return n.toLocaleString("ja-JP", { maximumFractionDigits: 0 });
}

type StoredV2 = { v: 2; openingBalance: number; logs: LogItem[] };

export default function MoneyLogForm() {
  const [openingBalance, setOpeningBalance] = useState<number>(0);

  const [logs, setLogs] = useState<LogItem[]>([]);
  const [kind, setKind] = useState<MoneyKind>("EXPENSE");
  const [parent, setParent] = useState<ParentKey>("LIFE");
  const [child, setChild] = useState<string>(CHILDREN.LIFE[0]);

  const [amount, setAmount] = useState<string>("");
  const [memo, setMemo] = useState<string>("");
  const [placeTag, setPlaceTag] = useState<LogItem["placeTag"]>("home");
  const [occurredAtInput, setOccurredAtInput] = useState<string>(() => toDatetimeLocal(Date.now()));

  /** =========
   * Load
   * ========= */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);

      // v2（推奨）
      if (parsed?.v === 2 && Array.isArray(parsed.logs)) {
        setOpeningBalance(typeof parsed.openingBalance === "number" ? parsed.openingBalance : 0);
        setLogs(parsed.logs);
        return;
      }

      // 旧：配列だけ保存してた場合（後方互換）
      if (Array.isArray(parsed)) {
        setLogs(parsed);
        setOpeningBalance(0);
      }
    } catch {
      // βの優しさ
    }
  }, []);

  /** =========
   * Save
   * ========= */
  useEffect(() => {
    try {
      const data: StoredV2 = { v: 2, openingBalance, logs };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [openingBalance, logs]);

  /** kind を変えたら parent/child を自然に寄せる */
  useEffect(() => {
    if (kind === "INCOME") {
      setParent("INCOME");
      setChild(CHILDREN.INCOME[0]);
      return;
    }
    // expense に戻ったら LIFE に戻す（好みで FIXED でもOK）
    if (parent === "INCOME") {
      setParent("LIFE");
      setChild(CHILDREN.LIFE[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  /** parent 変えたら child を追従 */
  useEffect(() => {
    const first = CHILDREN[parent]?.[0] ?? "その他";
    setChild(first);
  }, [parent]);

  /** =========
   * Add / Remove
   * ========= */
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

    setLogs((prev) => [item, ...prev].sort((a, b) => b.occurredAt - a.occurredAt));
    setAmount("");
    setMemo("");
  }

  function removeLog(id: string) {
    setLogs((prev) => prev.filter((x) => x.id !== id));
  }

  function clearAll() {
    setLogs([]);
  }

  /** =========
   * Aggregations
   * ========= */
  const summary = useMemo(() => {
    const incomeTotal = logs.filter((x) => x.kind === "INCOME").reduce((s, x) => s + x.amount, 0);
    const expenseTotal = logs.filter((x) => x.kind === "EXPENSE").reduce((s, x) => s + x.amount, 0);

    const balance = openingBalance + incomeTotal - expenseTotal;

    const byBucket: Record<string, number> = { 朝: 0, 昼: 0, 夜: 0, 深夜: 0 };
    const now = Date.now();

    const todayKey = new Date().toDateString();
    const todayExpense = logs
      .filter((x) => x.kind === "EXPENSE" && new Date(x.occurredAt).toDateString() === todayKey)
      .reduce((s, x) => s + x.amount, 0);

    const last24hExpense = logs
      .filter((x) => x.kind === "EXPENSE" && now - x.occurredAt <= 24 * 60 * 60 * 1000)
      .reduce((s, x) => s + x.amount, 0);

    for (const x of logs) {
      if (x.kind === "EXPENSE") byBucket[timeBucket(x.occurredAt)] += x.amount;
    }

    const totalExpense = expenseTotal;
    const nightRate = totalExpense > 0 ? Math.round((byBucket["深夜"] / totalExpense) * 100) : 0;

    return { incomeTotal, expenseTotal, balance, todayExpense, last24hExpense, byBucket, nightRate };
  }, [logs, openingBalance]);

  /** =========
   * Prompt（核ワード：必要経費？衝動？）
   * ========= */
  const promptText = useMemo(() => {
    if (!amount) return null;
    if (kind === "INCOME") return "これ、給料？返金？一時的？";
    if (parent === "FUN") return "これ、回復？逃避？衝動？";
    if (placeTag === "move") return "これ、移動？ついで買い？";
    return "これ、必要経費？衝動？";
  }, [amount, kind, parent, placeTag]);

  /** =========
   * UI
   * ========= */
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-slate-300">
          “点の支出”じゃなく、<span className="font-semibold">時系列の流れ（時空間連続性）</span>で見るログ。
        </p>
      </header>

      {/* 開始残高 + 入金/支出 */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
        <div className="grid gap-3 md:grid-cols-6">
          <div className="md:col-span-2">
            <label className="text-xs text-slate-300">開始残高（必須）</label>
            <input
              className="mt-1 w-full rounded-lg bg-slate-950/60 border border-white/10 px-3 py-2"
              inputMode="numeric"
              value={String(openingBalance)}
              onChange={(e) => setOpeningBalance(Number(e.target.value))}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-slate-300">種別</label>
            <select
              className="mt-1 w-full rounded-lg bg-slate-950/60 border border-white/10 px-3 py-2"
              value={kind}
              onChange={(e) => setKind(e.target.value as MoneyKind)}
            >
              <option value="EXPENSE">支出</option>
              <option value="INCOME">入金</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-slate-300">金額（JPY）</label>
            <input
              className="mt-1 w-full rounded-lg bg-slate-950/60 border border-white/10 px-3 py-2"
              placeholder="例：1200"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        {/* カテゴリ群 */}
        <div className="grid gap-3 md:grid-cols-5">
          <div className="md:col-span-1">
            <label className="text-xs text-slate-300">親カテゴリ</label>
            <select
              className="mt-1 w-full rounded-lg bg-slate-950/60 border border-white/10 px-3 py-2"
              value={parent}
              onChange={(e) => setParent(e.target.value as ParentKey)}
              disabled={kind === "INCOME"}
            >
              {kind === "INCOME" ? (
                <option value="INCOME">INCOME</option>
              ) : (
                <>
                  <option value="FIXED">FIXED</option>
                  <option value="LIFE">LIFE</option>
                  <option value="WORK">WORK</option>
                  <option value="FUN">FUN</option>
                  <option value="OTHER">OTHER</option>
                </>
              )}
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
            <label className="text-xs text-slate-300">場所（ざっくり）</label>
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

          <div className="md:col-span-1">
            <label className="text-xs text-slate-300">発生時刻</label>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-lg bg-slate-950/60 border border-white/10 px-3 py-2"
              value={occurredAtInput}
              onChange={(e) => setOccurredAtInput(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-5 items-end">
          <div className="md:col-span-1">
            <button
              className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 hover:bg-white/15"
              onClick={() => setOccurredAtInput(toDatetimeLocal(Date.now()))}
              type="button"
            >
              今
            </button>
          </div>

          <div className="md:col-span-4">
            <label className="text-xs text-slate-300">メモ（任意）</label>
            <input
              className="mt-1 w-full rounded-lg bg-slate-950/60 border border-white/10 px-3 py-2"
              placeholder="例：深夜テンションでコンビニ"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>
        </div>

        {promptText && (
          <div className="text-sm text-slate-200">
            👉 <span className="font-semibold">{promptText}</span>
          </div>
        )}

        <div className="flex gap-2">
          <button
            className="rounded-lg bg-white text-slate-950 px-4 py-2 font-semibold hover:opacity-90"
            onClick={addLog}
            type="button"
          >
            追加
          </button>
          <button
            className="rounded-lg border border-white/15 bg-transparent px-4 py-2 hover:bg-white/10"
            onClick={clearAll}
            type="button"
          >
            全消し
          </button>
          <div className="ml-auto text-xs text-slate-400 self-center">
            自動保存：ON（localStorage）
          </div>
        </div>
      </section>

      {/* サマリ（残高が“床”を判定） */}
      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-slate-300">残高</div>
          <div className="text-2xl font-bold">¥ {formatJPY(summary.balance)}</div>
          {summary.balance < 0 && (
            <div className="mt-2 text-xs text-red-200">
              ⚠️ 残高がマイナス（床が抜けました）。入金 or 開始残高を確認してね。
            </div>
          )}
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-slate-300">今日の支出</div>
          <div className="text-2xl font-bold">¥ {formatJPY(summary.todayExpense)}</div>
          <div className="mt-2 text-xs text-slate-400">“今日の流れ”を折らないのが勝ち筋</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-slate-300">直近24hの支出</div>
          <div className="text-2xl font-bold">¥ {formatJPY(summary.last24hExpense)}</div>
          <div className="mt-2 text-xs text-slate-400">ここが “速度（velocity）” の入口</div>
        </div>
      </section>

      {/* 時間帯（支出のみ） */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h2 className="font-semibold mb-3">時間帯バケット（時空間連続性：時）</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {(["朝", "昼", "夜", "深夜"] as const).map((k) => (
            <div key={k} className="rounded-lg border border-white/10 bg-slate-950/40 p-3">
              <div className="text-xs text-slate-300">{k}</div>
              <div className="text-lg font-semibold">¥ {formatJPY(summary.byBucket[k] ?? 0)}</div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-slate-400">深夜比率：{summary.nightRate}%（蒸発ポイント候補）</div>
      </section>

      {/* ログ一覧 */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h2 className="font-semibold mb-3">ログ（occurredAt で並べる）</h2>
        {logs.length === 0 ? (
          <p className="text-slate-300 text-sm">まだログがない。まずは1件、現実世界から拾ってこい🫳🌍</p>
        ) : (
          <div className="space-y-2">
            {logs.map((x) => (
              <div
                key={x.id}
                className="rounded-lg border border-white/10 bg-slate-950/40 p-3 flex items-center gap-3"
              >
                <div className="min-w-[88px] text-xs text-slate-300">
                  {timeBucket(x.occurredAt)}
                  <div className="text-slate-400">{new Date(x.occurredAt).toLocaleString("ja-JP")}</div>
                </div>

                <div className="flex-1">
                  <div className="font-semibold">
                    {x.kind === "INCOME" ? "INCOME" : x.parent} / {x.child}
                    {x.placeTag ? <span className="ml-2 text-xs text-slate-400">({x.placeTag})</span> : null}
                  </div>
                  {x.memo ? <div className="text-xs text-slate-300 mt-1">{x.memo}</div> : null}
                </div>

                <div className="text-right">
                  <div className="font-bold">
                    {x.kind === "INCOME" ? "＋" : "－"} ¥ {formatJPY(x.amount)}
                  </div>
                  <button
                    className="mt-1 text-xs text-slate-400 hover:text-white"
                    onClick={() => removeLog(x.id)}
                    type="button"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
