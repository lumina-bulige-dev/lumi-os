// cloudflare-env.d.ts
// Next.js の型チェックで怒られないようにするためのダミー定義。
// 実際の Worker ランタイムでは Cloudflare 側が本物を持っている。

interface KVNamespace {
  get(key: string, options?: unknown): Promise<unknown>;
  put(key: string, value: string, options?: unknown): Promise<void>;
  delete(key: string, options?: unknown): Promise<void>;
}
