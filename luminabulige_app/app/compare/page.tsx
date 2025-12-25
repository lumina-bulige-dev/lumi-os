// app/compare/page.tsx
const V = 480_000; // 年間取引額

export default function ComparePage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Compare – Legacy vs LUMINA</h1>
      <p className="text-sm text-slate-300">
        年間 {V.toLocaleString()} 円のクロスボーダー取引を想定した場合の、
        トータルコストの比較です。
      </p>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-800 text-slate-400">
            <tr>
              <th className="px-4 py-2">項目</th>
              <th className="px-4 py-2">従来サービス</th>
              <th className="px-4 py-2">LUMINA</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-800">
              <td className="px-4 py-2">トータル手数料率</td>
              <td className="px-4 py-2">約 4%</td>
              <td className="px-4 py-2">2%</td>
            </tr>
            <tr className="border-b border-slate-800">
              <td className="px-4 py-2">年間コスト</td>
              <td className="px-4 py-2">¥19,200</td>
              <td className="px-4 py-2">¥9,600</td>
            </tr>
            <tr>
              <td className="px-4 py-2">ユーザーの「守れたお金」</td>
              <td className="px-4 py-2 text-slate-500">–</td>
              <td className="px-4 py-2">約 ¥9,600 / 年 / 人</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
