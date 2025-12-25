// cloudflare-env.d.ts
// Next.js の型チェックで怒られないようにするためのダミー定義。
// 実際の Worker ランタイムでは Cloudflare 側が本物を持っている。
type D1Database = any;
interface KVNamespace {
  get(key: string, options?: unknown): Promise<unknown>;
  put(key: string, value: string, options?: unknown): Promise<void>;
  delete(key: string, options?: unknown): Promise<void>;
}

// D1 Database のざっくり型（最低限でOK）
interface D1Database {
  prepare(query: string): {
    bind(...values: unknown[]): D1PreparedStatement;
    first<T = unknown>(columnName?: string): Promise<T | null>;
    all<T = unknown>(): Promise<{ results: T[] }>;
  };
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(columnName?: string): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[] }>;
}
