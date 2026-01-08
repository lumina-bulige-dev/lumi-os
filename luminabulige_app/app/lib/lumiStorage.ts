import type { Level } from "./lumiRules";
import { calcLevel } from "./lumiRules";
// luminabulige_app/app/lib/lumiStorage.ts

// ローカル or Session Storage から安全に読むユーティリティ
export function lumiLoad<T>(key: string, fallback: T): T {
  // SSR や Edge で window がない場合は fallback を返す
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function lumiSave(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage フルとかは無視して落とさない
  }
}
