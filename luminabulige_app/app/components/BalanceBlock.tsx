// app/components/BalanceBlock.tsx
"use client";

export default function BalanceBlock() {
  // 例：どこかで startBalance, incomesTotal, expensesTotal を持ってる想定
  const balance = startBalance + incomesTotal - expensesTotal;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm text-slate-300">現在残高</div>
      <div className="mt-1 text-2xl font-semibold">{balance.toLocaleString()} 円</div>

      {/* 👇ここに置く（残高の直下） */}
      {balance < 0 && (
        <div className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          ⚠️ 残高がマイナスです（床が抜けました）。入金 or 開始残高を確認してね。
        </div>
      )}
    </div>
  );
}
