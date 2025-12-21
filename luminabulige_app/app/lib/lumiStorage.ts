import type { Level } from "./lumiRules";
import { calcLevel } from "./lumiRules";
const LOG_KEY = 'lumi_logs_v1';

function todayYYYYMMDD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

type LogItem = {
  date: string;
  level: Level;
  balance: number;
  floor: number;
  diff: number;
};

function saveLog(item: LogItem) {
  const raw = localStorage.getItem(LOG_KEY);
  const arr: LogItem[] = raw ? JSON.parse(raw) : [];

  // 同日があれば上書き
  const filtered = arr.filter(x => x.date !== item.date);
  filtered.unshift(item); // 新しいのを先頭に

  // 直近30件に制限
  localStorage.setItem(LOG_KEY, JSON.stringify(filtered.slice(0, 30)));
}
export const KEYS = {
  compare: "lumi:compare:v1",
  dailyLogs: "lumi:dailyLogs:v1",
  legacyCompare: "lumi_compare_v1", // 既存互換
} as const;

export type DailyLog = {
  date: string;        // YYYY-MM-DD
  balanceYen: number;
  floorYen: number;
  level: Level;
  diffYen: number;
};

export function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function loadCompare(): { balance: number; floor: number } {
  const v1 = safeJson(KEYS.compare);
  if (v1 && typeof v1.balance === "number" && typeof v1.floor === "number") {
    return { balance: v1.balance, floor: v1.floor };
  }

  const legacy = safeJson(KEYS.legacyCompare);
  if (legacy && typeof legacy.balance === "number" && typeof legacy.floor === "number") {
    saveCompare(legacy.balance, legacy.floor); // 新キーへ移行
    return { balance: legacy.balance, floor: legacy.floor };
  }

  return { balance: 0, floor: 0 };
}

export function saveCompare(balance: number, floor: number) {
  localStorage.setItem(KEYS.compare, JSON.stringify({ balance, floor }));
}

export function loadDailyLogs(): DailyLog[] {
  const raw = safeJson(KEYS.dailyLogs);
  if (!raw || !Array.isArray(raw)) return [];
  return raw.filter(isDailyLog);
}

export function upsertTodayLog(balanceYen: number, floorYen: number) {
  const date = todayISO();
  const level = calcLevel(balanceYen, floorYen);
  const diffYen = balanceYen - floorYen;

  const logs = loadDailyLogs();
  const next: DailyLog = { date, balanceYen, floorYen, level, diffYen };

  const withoutToday = logs.filter((x) => x.date !== date);
  const updated = [next, ...withoutToday].sort((a, b) => (a.date < b.date ? 1 : -1));

  localStorage.setItem(KEYS.dailyLogs, JSON.stringify(updated));
  return next;
}

export function last30(logs: DailyLog[]): DailyLog[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 29);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return logs.filter((x) => x.date >= cutoffStr).sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function summarize(logs: DailyLog[]) {
  const safe = logs.filter((x) => x.level === "SAFE").length;
  const warning = logs.filter((x) => x.level === "WARNING").length;
  const danger = logs.filter((x) => x.level === "DANGER").length;
  return { safe, warning, danger, total: logs.length };
}

function safeJson(key: string): any | null {
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
