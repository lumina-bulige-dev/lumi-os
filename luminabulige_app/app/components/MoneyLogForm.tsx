"use client";
import { useEffect, useMemo, useState } from "react";

export default function MoneyLogForm() {
  // ここが「状態の置き場」(3)
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [income, setIncome] = useState<number>(0);
  const [expense, setExpense] = useState<number>(0);

  // 自動保存（例）
  useEffect(() => {
    const data = { openingBalance, income, expense };
    localStorage.setItem("moneylog_v1", JSON.stringify(data));
  }, [openingBalance, income, expense]);

  // 自動復元（例）
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

  const balance = useMemo(() => openingBalance + income - expense, [openingBalance, income, expense]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
      {/* 入力UI */}
      <div className="grid gap-3">
        <label className="text-sm text-slate-300">
          開始残高（必須）
          <input className="mt-1 w-full rounded-md bg-slate-900 p-2"
            type="number" value={openingBalance}
            onChange={(e) => setOpeningBalance(Number(e.target.value))}
          />
        </label>

        <label className="text-sm text-slate-300">
          入金（必須）
          <input className="mt-1 w-full rounded-md bg-slate-900 p-2"
            type="number" value={income}
            onChange={(e) => setIncome(Number(e.target.value))}
          />
        </label>

        <label className="text-sm text-slate-300">
          支出（必須）
          <input className="mt-1 w-full rounded-md bg-slate-900 p-2"
            type="number" value={expense}
            onChange={(e) => setExpense(Number(e.target.value))}
          />
        </label>

        <div className="mt-2 text-slate-200">
          残高：<span className="font-mono">{balance}</span>
        </div>
      </div>
    </div>
  );
}
