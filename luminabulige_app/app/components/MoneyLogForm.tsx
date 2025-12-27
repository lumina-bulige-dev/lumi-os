"use client";

import { useEffect, useMemo, useState } from "react";
import BalanceBlock from "./BalanceBlock";

export default function MoneyLogForm() {
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [income, setIncome] = useState<number>(0);
  const [expense, setExpense] = useState<number>(0);

  // 自動復元
  useEffect(() => {
    const raw = localStorage.getItem("moneylog_v1");
    if (!raw) return;
    try {
      const d = JSON.parse(raw);
      if (typeof d.openingBalance === "number") setOpeningBalance(d.openingBalance);
      if (typeof d.income === "number") setIncome(d.income);
      if (typeof d.expense === "number") setExpense(d.expense);
    } catch {}
  }, []);

  // 自動保存
  useEffect(() => {
    const data = { openingBalance, income, expense };
    localStorage.setItem("moneylog_v1", JSON.stringify(data));
  }, [openingBalance, income, expense]);

  const balance = useMemo(
    () => openingBalance + income - expense,
    [openingBalance, income, expense]
  );

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
      <div className="grid gap-3">
        <label className="text-sm text-slate-300">
          開始残高（必須）
          <input
            className="mt-1 w-full rounded-md bg-slate-900 p-2"
            type="number"
            value={openingBalance}
            onChange={(e) => setOpeningBalance(Number(e.target.value))}
          />
        </label>

        <label className="text-sm text-slate-300">
          入金（必須）
          <input
            className="mt-1 w-full rounded-md bg-slate-900 p-2"
            type="number"
            value={income}
            onChange={(e) => setIncome(Number(e.target.value))}
          />
        </label>

        <label className="text-sm text-slate-300">
          支出（必須）
          <input
            className="mt-1 w-full rounded-md bg-slate-900 p-2"
            type="number"
            value={expense}
            onChange={(e) => setExpense(Number(e.target.value))}
          />
        </label>

        <div className="mt-2 text-slate-200">
          残高：<span className="font-mono">{balance.toLocaleString()}</span>
        </div>

        <div className="mt-3">
          <BalanceBlock
            startBalance={openingBalance}
            incomesTotal={income}
            expensesTotal={expense}
          />
        </div>
      </div>
    </div>
  );
}
