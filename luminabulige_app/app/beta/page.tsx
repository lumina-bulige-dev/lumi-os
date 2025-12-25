// app/beta/page.tsx
// app/beta/page.tsx
import { lumiLoad } from "../lib/lumiStorage";
export default function BetaPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">LUMINA Beta</h1>
      <p className="text-sm text-slate-300">
        いまはクローズドβです。行動ログ・手数料レポートの精度を上げながら、
        A / A+ ユーザーから順番に解禁していきます。
      </p>

      <ul className="space-y-2 text-sm text-slate-300">
        <li>・月次レポート（SAFE / WARNING / DANGER）</li>
        <li>・「今月の手数料を見る」ダッシュボード</li>
        <li>・企業向け CIA レポート（準備中）</li>
      </ul>

      <a
        href="https://forms.gle/"
        className="inline-flex items-center rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950"
      >
        β版待機リストに登録
      </a>
    </section>
  );
}
