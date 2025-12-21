'use client';

import { useEffect, useMemo, useState } from 'react';

type Level = 'SAFE' | 'WARNING' | 'DANGER';

function calcLevel(balance: number, floor: number): Level {
  if (balance >= floor * 1.2) return 'SAFE';
  if (balance >= floor) return 'WARNING';
  return 'DANGER';
}

export default function ComparePage() {
  const [balance, setBalance] = useState<number>(0);
  const [floor, setFloor] = useState<number>(0);

  // 初回：保存値を復元
  useEffect(() => {
    const saved = localStorage.getItem('lumi_compare_v1');
    if (!saved) return;
    try {
      const obj = JSON.parse(saved);
      if (typeof obj.balance === 'number') setBalance(obj.balance);
      if (typeof obj.floor === 'number') setFloor(obj.floor);
    } catch {}
  }, []);

  // 変更時：保存
  useEffect(() => {
    localStorage.setItem('lumi_compare_v1', JSON.stringify({ balance, floor }));
  }, [balance, floor]);

  const level = useMemo(() => calcLevel(balance, floor), [balance, floor]);
  const diff = useMemo(() => balance - floor, [balance, floor]);

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 40, marginBottom: 8 }}>Compare</h1>
      <p style={{ opacity: 0.8, marginBottom: 24 }}>
        入力した数字で、今日の安全度を即計算します（端末に保存）。
      </p>

      <section style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
        <label>
          残高（円）
          <input
            type="number"
            value={balance}
            onChange={(e) => setBalance(Number(e.target.value))}
            style={{ width: '100%', padding: 12, fontSize: 16, marginTop: 6 }}
            placeholder="例: 123456"
          />
        </label>

        <label>
          Floor（絶対割れない下限・円）
          <input
            type="number"
            value={floor}
            onChange={(e) => setFloor(Number(e.target.value))}
            style={{ width: '100%', padding: 12, fontSize: 16, marginTop: 6 }}
            placeholder="例: 100000"
          />
        </label>
      </section>

      <section style={{ padding: 16, border: '1px solid #ddd', borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>判定</h2>
        <p style={{ fontSize: 22, margin: '8px 0' }}>
          今日の安全度：<b>{level}</b>
        </p>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Floorとの差分：<b>{diff.toLocaleString()}円</b>
        </p>
      </section>

      <p style={{ marginTop: 18, opacity: 0.7 }}>
        ※Wise/銀行連携はまだ無し。ここで“数字が動く”状態を先に固める。
      </p>
    </main>
  );
}
