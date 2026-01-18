// app/lib/db.ts

export type Db = {
  execute: (sql: string, params?: any[]) => Promise<any>;
};

/**
 * DB Adapter selector
 * - dev: in-memory / mock
 * - prod: Cloudflare D1 / Turso / etc
 */
export async function getDb(): Promise<Db> {
  const driver = process.env.LUMI_DB_DRIVER ?? "stub";

  switch (driver) {
    case "stub":
      return createStubDb();

    // 将来差し替え
    // case "d1":
    //   return createD1Db();
    // case "turso":
    //   return createTursoDb();

    default:
      throw new Error(`Unknown DB driver: ${driver}`);
  }
}

/* -----------------------------
 * Stub DB (safe default)
 * ----------------------------- */

function createStubDb(): Db {
  return {
    async execute(sql: string, params: any[] = []) {
      console.warn("[DB:STUB] execute called");
      console.warn(sql);
      console.warn(params);

      // Decision approve flow が死なない最低限
      return {
        rows: [],
        rowsAffected: 1,
      };
    },
  };
}
