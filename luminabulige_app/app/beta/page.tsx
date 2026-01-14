// app/beta/page.tsx
import Link from "next/link";

const items = [
  { href: "/cia", title: "CIA", desc: "行動ログベースの監査ビュー（提出物の概念）" },
  { href: "/compare", title: "Compare", desc: "他社KYC/信用スコアと比較する思考実験" },
  { href: "/compare", title: "Money Stabilizer", desc: "30日ログ入力へ（床抜け検知つき）" },
   // ここにチャットへの導線を追加
  { href: "/finance-chat", title: "Finance Chat", desc: "v0.app連携の実験的AIチャット" },
];

export default function BetaPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight">Beta（案内）</h1>
        <p className="text-slate-300">
          まず触る → 次に読む。βは “信用の結論” じゃなく “素材” を作る実験場。
        </p>

        {/* すぐ触れる導線（ボタン） */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Link href="/compare" className="primary-cta">Money Stabilizer</Link>
          <Link href="/cia" className="secondary-cta">CIA</Link>
          <Link href="/" className="secondary-cta">LP</Link>
        </div>
      </header>

      {/* 入口カード */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
        <div className="text-xs text-slate-400">入口</div>

        <div className="grid gap-2">
          {items.map((x) => (
            <Link
              key={x.href + x.title}
              href={x.href}
              className="rounded-xl border border-white/10 bg-slate-950/30 p-4 hover:bg-white/10 transition"
            >
              <div className="font-semibold">{x.title}</div>
              <div className="text-sm text-slate-300 mt-1">{x.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* 注意 */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-2">
        <h2 className="text-xl font-bold">注意（β版）</h2>
        <ul className="list-disc pl-5 text-slate-200 space-y-1">
          <li>UI・文言・仕様は予告なく変更されます。</li>
          <li>信用は「結論」じゃなく「材料」。最終判断はユーザー自身。</li>
          <li>問い合わせ返信は当面 luminabulige@gmail.com から行います。</li>
        </ul>
      </section>
    </main>
  );
}
