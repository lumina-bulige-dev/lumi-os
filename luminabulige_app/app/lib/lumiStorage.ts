import type { Level } from "./lumiRules";
import { calcLevel } from "./lumiRules";

export const KEYS = {
  compare: "lumi:compare:v1",
  dailyLogs: "lumi:dailyLogs:v1",
  legacyCompare: "lumi_compare_v1", // 既存互換（Compare旧キー）
} as const;

export type DailyLog = {
  date: string; // YYYY-MM-DD
  balanceYen: number;
  floorYen: number;
  level: Level;
  diffYen: number;
};

// これだけでOK（beta側の import を変えたくないなら）
export function loadLogs(): DailyLog[] {
  return loadDailyLogs();
}
export function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Compare入力値を復元（新キー優先、無ければ旧キーを吸い上げて移行） */
export function loadCompare(): { balance: number; floor: number } {
  const v1 = safeJson(KEYS.compare);
  if (v1 && typeof v1.balance === "number" && typeof v1.floor === "number") {
    return { balance: v1.balance, floor: v1.floor };
  }

  const legacy = safeJson(KEYS.legacyCompare);
  if (legacy && typeof legacy.balance === "number" && typeof legacy.floor === "number") {
    // 新キーへ移行
    saveCompare(legacy.balance, legacy.floor);
    return { balance: legacy.balance, floor: legacy.floor };
  }

  return { balance: 0, floor: 0 };
}

/** Compare入力値を保存 */
export function saveCompare(balance: number, floor: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.compare, JSON.stringify({ balance, floor }));
}

/** 30日ログを読み込み */
export function loadDailyLogs(): DailyLog[] {
  const raw = safeJson(KEYS.dailyLogs);
  if (!raw || !Array.isArray(raw)) return [];
  return raw.filter(isDailyLog);
}

/**
 * 今日のログを upsert（同日上書き）して保存
 * - 最大30件に制限
 */
export function upsertTodayLog(balanceYen: number, floorYen: number) {
  if (typeof window === "undefined") { /* 省略 */ }

  // ✅ ここ追加（stringでも確実にnumber化）
  const b = Number(balanceYen);
  const f = Number(floorYen);
  if (!Number.isFinite(b) || !Number.isFinite(f)) {
    throw new Error("Invalid balance/floor");
  }

  const date = todayISO();
  const level = calcLevel(b, f);
  const diffYen = b - f;

  const logs = loadDailyLogs();
  const next: DailyLog = { date, balanceYen: b, floorYen: f, level, diffYen };

  const withoutToday = logs.filter((x) => x.date !== date);
  const updated = [next, ...withoutToday]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 30);

  localStorage.setItem(KEYS.dailyLogs, JSON.stringify(updated));
  return next;
}

/** 直近30日ぶんを抽出（表示用） */
export function last30(logs: DailyLog[]): DailyLog[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 29);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  return logs
    .filter((x) => x.date >= cutoffStr)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** SAFE/WARNING/DANGER の集計 */
export function summarize(logs: DailyLog[]) {
  const safe = logs.filter((x) => x.level === "SAFE").length;
  const warning = logs.filter((x) => x.level === "WARNING").length;
  const danger = logs.filter((x) => x.level === "DANGER").length;
  return { safe, warning, danger, total: logs.length };
}

function safeJson(key: string): any | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isDailyLog(x: any): x is DailyLog {
  return (
    x &&
    typeof x.date === "string" &&
    typeof x.balanceYen === "number" &&
    typeof x.floorYen === "number" &&
    (x.level === "SAFE" || x.level === "WARNING" || x.level === "DANGER") &&
    typeof x.diffYen === "number"
  );
}
