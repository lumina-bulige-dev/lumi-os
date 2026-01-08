// app/cia/model.ts
export type TxType = "expense" | "income" | "transfer";

export type Tx = {
  id: string;
  type: TxType;
  date: string; // "YYYY-MM-DD"
  amount: number; // JPY前提の最小。多通貨は後で拡張。
  parentCategoryId?: string; // expense/incomeのみ
  childCategoryId?: string;  // 任意
  note?: string;

  // transfer用（支出と完全分離）
  fromAccount?: string;
  toAccount?: string;
  fee?: number; // 手数料だけは expense として別TxにしてもOK（後で決める）
};

export type CategoryParent = {
  id: string;
  label: string;
  required: boolean; // 14固定を保護
};

export type CategoryChild = {
  id: string;
  parentId: string;
  label: string;
};

export type ActionLog = {
  id: string;
  at: string; // ISO
  actionType: "cut" | "delay" | "compare" | "other";
  label: string; // 例: "サブスク削除"
  meta?: Record<string, any>;
};

export type Snapshot = {
  id: string;
  at: string; // ISO
  ym: string; // "YYYY-MM"
  safeRatePct: number; // 0-100
  predictedBalance: number; // ざっくりでOK
  totalExpenseMTD: number; // 月累計支出
};
