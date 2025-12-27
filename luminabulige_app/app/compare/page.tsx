// app/compare/page.tsx
import MoneyLogForm from "../components/MoneyLogForm";

export default function ComparePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Compare（Money Stabilizer）</h1>
      <p className="mt-2 text-slate-300">
        ここは説明。入力と計算はフォーム側に分離。
      </p>

      <div className="mt-6">
        <MoneyLogForm />
      </div>
    </main>
  );
}
