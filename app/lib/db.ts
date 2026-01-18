// app/lib/db.ts
export type Db = {
  // execute: 返り値はドライバによって違うので最低限にする
  execute: (sql: string, params?: any[]) => Promise<any>;
};

// TODO: 既存のDB接続に差し替える
export async function getDb(): Promise<Db> {
  throw new Error("getDb() not implemented. Wire to existing DB client.");
}
