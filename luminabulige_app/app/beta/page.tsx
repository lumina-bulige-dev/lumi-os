// app/beta/page.tsx
export default function BetaPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">LUMI / β版ラボ</h1>
      <p className="text-sm text-slate-300">
        ここでは、行動ログや残高のサマリをテスト表示していきます。
      </p>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm">
        <p className="text-slate-200">
          （モック）直近30日サマリや、支出のSAFE / WARNING / DANGER分布を
          ここに出していく予定。
        </p>
      </div>
    </section>
  );
}
