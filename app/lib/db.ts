// app/lib/db.ts
import { getRequestContext } from "@cloudflare/next-on-pages";

export type Db = {
  execute: (sql: string, params?: any[]) => Promise<any>;
};

export async function getDb(): Promise<Db> {
  const driver = process.env.LUMI_DB_DRIVER ?? "d1"; // 既定をd1推奨（ローカルはstubにしてもOK）
console.log("[DB_DRIVER]", driver); // ← ここが正解
  switch (driver) {
    case "d1":
      return createD1Db();
    case "stub":
      return createStubDb();
    default:
      throw new Error(`Unknown DB driver: ${driver}`);
  }
}

/** Cloudflare D1 adapter */
function createD1Db(): Db {
  const { env } = getRequestContext();
  const db = env.DB as D1Database | undefined;
  if (!db) throw new Error("D1 binding 'DB' is missing. Set Pages/Workers binding name = DB");

  return {
    async execute(sql: string, params: any[] = []) {
      // D1: .all() は { results, success, meta } を返す
      // INSERT/UPDATEでも results=[] になるが meta.changes 等で判断可能
      const stmt = db.prepare(sql);
      const bound = params.length ? stmt.bind(...params) : stmt;
      return await bound.all();
    },
  };
}

/** Safe stub */
function createStubDb(): Db {
  return {
    async execute(sql: string, params: any[] = []) {
      console.warn("[DB:STUB]", sql, params);
      return { results: [], success: true, meta: { changes: 1 } };
    },
  };
}
