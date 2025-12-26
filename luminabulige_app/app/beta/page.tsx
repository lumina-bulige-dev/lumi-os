// app/beta/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Beta | LUMINA",
};

export default function BetaPage() {
  return (
    <main className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight">
          LUMINA CIA / oKYC β版
        </h1>
        <p className="text-slate-300 leading-relaxed">
          信用情報やスコアに頼りきらず、<b>「行動ログ」</b>と<b>「本人主導の Trast / BULIG Rank」</b>で
          人柄と信頼度を“見える化”するためのレイヤーです。
          <br />
          日本在住の外国人・海外在住日本人、そして従来の与信に乗りにくい人を主ターゲットにしています。
        </p>
      </header>

      <section className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3">
        <h2 className="text-xl font-bold">β版で試せること</h2>
        <ul className="list-disc pl-5 text-slate-200 space-y-2">
          <li>CIA レポート（行動ログベースの監査ビュー）プレビュー</li>
          <li>oKYC（Owner KYC）コンセプトの事前説明</li>
          <li>Trast / BULIG Rank の設計方針・利用イメージ</li>
          <li>Compare：他社KYC/信用スコアとの思想差分</li>
        </ul>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <Link
          href="/cia"
          className="rounded-xl border border-white/12 bg-white/5 px-4 py-4 hover:bg-white/10"
        >
          <div className="font-bold">CIA</div>
          <div className="text-xs text-slate-300 mt-1">行動ログの監査レイヤー</div>
        </Link>

        <Link
          href="/compare"
          className="rounded-xl border border-white/12 bg-white/5 px-4 py-4 hover:bg-white/10"
        >
          <div className="font-bold">Compare</div>
          <div className="text-xs text-slate-300 mt-1">他社KYC/信用スコアと比較</div>
        </Link>

        <Link
          href="/compare"
          className="rounded-xl border border-white/12 bg-white px-4 py-4 text-slate-950 font-bold hover:opacity-90"
        >
          今すぐ β を触る
          <div className="text-xs font-normal opacity-80 mt-1">
            Money Stabilizer / ログ入力へ
          </div>
        </Link>
      </section>

      <section className="rounded-xl border border-white/10 bg-slate-950/40 p-5 space-y-2">
        <h2 className="font-bold">注意（β版）</h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          UI・文言・仕様は予告なく変更されます。ここで表示される指標は、法的な与信判断・雇用判断・支払保証を意味しません。
          <br />
          信用は「結論」じゃなく「材料」。
        </p>
        <p className="text-xs text-slate-400">
          問い合わせ返信は当面 <span className="font-mono">luminabulige@gmail.com</span> から行います。
        </p>
      </section>
    </main>
  );
}
