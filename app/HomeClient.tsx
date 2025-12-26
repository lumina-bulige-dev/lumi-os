"use client";

import { useState } from "react";

export default function HomeClient() {
  const [balance] = useState(123_456);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">LUMINA BULIGE OS</h1>
      <p className="text-sm text-slate-300">
        行動ログとお金の流れから、「今の自分の信用」を見える化するOSです。
      </p>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm">
        <p className="text-slate-400">あなたの現在残高（モック）</p>
        <p className="text-2xl font-bold mt-1">
          ¥{balance.toLocaleString()}
        </p>
      </div>
    </section>
  );
}
