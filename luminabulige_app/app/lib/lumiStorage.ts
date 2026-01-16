// luminabulige_app/app/lib/lumiStorage.ts
"use client";

import type { EffectCallback } from "react";

// --- 基本設定 ----------------------------------------------------
const NS = "lumi"; // 名前空間
const SEP = ":";

type JsonValue = unknown;
type Millis = number;

type LoadOptions<T> = {
  /** TTL（ミリ秒）。期限切れは fallback を返しつつ自動削除 */
  ttlMs?: Millis;
  /** 取得時に型検証したい場合（zod などを想定） */
  validate?: (data: unknown) => data is T;
  /** JSON.parse の reviver（ISO日付 → Date 変換など） */
  reviver?: Parameters<typeof JSON.parse>[1];
};

type SaveOptions = {
  /** 保存する論理スキーマのバージョン（移行で使用） */
  version?: number;
  /** 上書き前に現在値を見てマージしたい時 */
  merge?: boolean;
};

type StoredEnvelope<T> = {
  __ns: typeof NS;
  __v: number;          // 論理バージョン
  __ts: number;         // 保存時刻 (ms)
  __ttl?: Millis;       // TTL（任意）
  payload: T;
};

// --- 環境依存ユーティリティ --------------------------------------
function storageAvailable(kind: "localStorage" | "sessionStorage" = "localStorage"): boolean {
  try {
    if (typeof window === "undefined") return false;
    const s = window[kind];
    const k = "__chk__" + Math.random().toString(36).slice(2);
    s.setItem(k, "1");
    s.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

const memoryStore = new Map<string, string>();

function getKV() {
  if (storageAvailable("localStorage")) {
    const s = window.localStorage;
    return {
      get: (k: string) => s.getItem(k),
      set: (k: string, v: string) => s.setItem(k, v),
      del: (k: string) => s.removeItem(k),
    };
  }
  // フォールバック：プロセス内メモリ
  return {
    get: (k: string) => memoryStore.get(k) ?? null,
    set: (k: string, v: string) => void memoryStore.set(k, v),
    del: (k: string) => void memoryStore.delete(k),
  };
}

function keyOf(raw: string) {
  return [NS, raw].join(SEP);
}

// --- 公開 API -----------------------------------------------------
/** 安全ロード（TTL/検証/SSR対応） */
export function lumiLoad<T>(rawKey: string, fallback: T, opt: LoadOptions<T> = {}): T {
  if (typeof window === "undefined") return fallback;

  const kv = getKV();
  const k = keyOf(rawKey);
  const raw = kv.get(k);
  if (!raw) return fallback;

  let env: StoredEnvelope<unknown> | null = null;
  try {
    env = JSON.parse(raw, opt.reviver as any);
  } catch {
    // 壊れていれば掃除
    kv.del(k);
    return fallback;
  }

  if (!env || typeof env !== "object") return fallback;
  const okNs = (env as any).__ns === NS;
  const ts = (env as any).__ts as number | undefined;
  const ttl = (env as any).__ttl as number | undefined;

  // TTL チェック
  if (okNs && typeof ts === "number" && typeof ttl === "number" && ttl > 0) {
    if (Date.now() > ts + ttl) {
      kv.del(k);
      return fallback;
    }
  }

  const data = (env as any).payload as unknown;

  // スキーマ検証（任意）
  if (opt.validate && !opt.validate(data)) {
    kv.del(k); // 異常系は捨てる
    return fallback;
  }

  return (data as T) ?? fallback;
}

/** 安全セーブ（バージョン/TTL/マージ/SSR対応） */
export function lumiSave<T>(
  rawKey: string,
  value: T,
  opt: SaveOptions & { ttlMs?: Millis } = {}
): void {
  if (typeof window === "undefined") return;
  const kv = getKV();
  const k = keyOf(rawKey);

  let payload: T = value;

  // merge 指定なら既存を取り出して浅マージ（オブジェクトのみ）
  if (opt.merge) {
    try {
      const existed = lumiLoad<unknown>(rawKey, null as any);
      if (existed && typeof existed === "object" && value && typeof value === "object") {
        payload = { ...(existed as any), ...(value as any) } as T;
      }
    } catch { /* noop */ }
  }

  const env: StoredEnvelope<T> = {
    __ns: NS,
    __v: opt.version ?? 1,
    __ts: Date.now(),
    __ttl: opt.ttlMs,
    payload,
  };

  try {
    kv.set(k, JSON.stringify(env));
  } catch {
    // 容量オーバー時など：最悪は上書き失敗でも落とさない
  }
}

/** 削除 */
export function lumiRemove(rawKey: string): void {
  if (typeof window === "undefined") return;
  getKV().del(keyOf(rawKey));
}

/** 名前空間ごと掃除（prefix一致） */
export function lumiClearNamespace(): void {
  if (typeof window === "undefined") return;
  if (!storageAvailable("localStorage")) {
    memoryStore.clear();
    return;
  }
  const s = window.localStorage;
  const pref = NS + SEP;
  const toDel: string[] = [];
  for (let i = 0; i < s.length; i++) {
    const k = s.key(i);
    if (k && k.startsWith(pref)) toDel.push(k);
  }
  toDel.forEach((k) => s.removeItem(k));
}

/** クロスタブ同期リスナ（unsub を返す） */
export function lumiOnChange(rawKey: string, cb: (newVal: string | null) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const k = keyOf(rawKey);
  const handler = (e: StorageEvent) => {
    if (e.key === k) cb(e.newValue);
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

// --- 互換ラッパ（既存コードのままでもOK） ------------------------
/** 旧API互換: シンプルロード */
export function legacyLoad<T>(key: string, fallback: T): T {
  return lumiLoad<T>(key, fallback);
}

/** 旧API互換: シンプルセーブ */
export function legacySave(key: string, value: unknown): void {
  return lumiSave(key, value as JsonValue);
}

// --- React ヘルパ（任意） ----------------------------------------
import { useEffect, useState } from "react";

/** useState + localStorage 同期（外部の型検証/TTLも使える） */
export function useLumiState<T>(
  key: string,
  initial: T,
  opt: LoadOptions<T> & SaveOptions & { ttlMs?: Millis } = {}
) {
  const [state, setState] = useState<T>(() => lumiLoad<T>(key, initial, opt));

  // 保存
  useEffect(() => {
    lumiSave<T>(key, state, opt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, state, opt.version]);

  // クロスタブ同期
  useEffect(() => {
    return lumiOnChange(key, () => {
      const next = lumiLoad<T>(key, initial, opt);
      setState(next);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [state, setState] as const;
}
