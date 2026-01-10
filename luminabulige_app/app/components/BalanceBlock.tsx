// app/components/BalanceBlock.tsx
"use client";

type Props = {
  startBalance: number;
  incomesTotal: number;
  expensesTotal: number;
  currency?: string;
};

export default function BalanceBlock({
  startBalance,
  incomesTotal,
  expensesTotal,
  currency = "JPY",
}: Props) {
  const balance = startBalance + incomesTotal - expensesTotal;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm text-slate-300">残高</div>
      <div className="mt-1 text-2xl font-semibold">
        {balance.toLocaleString()} {currency}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-300">
        <div className="rounded-lg border border-white/10 bg-black/20 p-2">
          <div className="opacity-70">開始残高</div>
          <div className="mt-1 text-slate-100">{startBalance.toLocaleString()}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/20 p-2">
          <div className="opacity-70">入金合計</div>
          <div className="mt-1 text-slate-100">{incomesTotal.toLocaleString()}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/20 p-2">
          <div className="opacity-70">支出合計</div>
          <div className="mt-1 text-slate-100">{expensesTotal.toLocaleString()}</div>
        </div>
      </div>

      {balance < 0 && (
        <div className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          ⚠️ 残高がマイナスです（床が抜けました）。入金 or 開始残高を確認してね。
        </div>
      )}
    </div>
  );
}
