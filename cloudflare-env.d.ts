// cloudflare-env.d.ts
// Next.js の型チェックで怒られないようにするためのダミー定義。
// 実際の Worker ランタイムでは Cloudflare 側が本物を持っている。
type D1Database = any;
// KV
interface KVNamespace {
  get(key: string, type?: "text"): Promise<string | null>;
  get(key: string, type: "json"): Promise<unknown>;
  get(key: string, type: "arrayBuffer"): Promise<ArrayBuffer | null>;
  get(key: string, type: "stream"): Promise<ReadableStream | null>;
  get(key: string, options?: unknown): Promise<unknown>;
  put(key: string, value: string, options?: unknown): Promise<void>;
  delete(key: string, options?: unknown): Promise<void>;
}

// D1（超ざっくりでOK。中身 any でもいい）
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(columnName?: string): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[] }>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

// Cloudflare Environment
interface CloudflareEnv {
  LUMI_PROOFS?: KVNamespace;
  PROOFS?: KVNamespace;
  PROOFS_JWKS?: string;
  LUMI_DB?: D1Database;
  DB?: D1Database;
}
