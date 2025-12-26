import "./globals.css";
import type { ReactNode } from "react";
import TopNav from "./components/TopNav"; // ← {} 外す

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-slate-950 text-slate-50 antialiased">
        <TopNav />
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
        <footer>
  <a href="/privacy">Privacy Policy（Beta）</a> ｜
  <a href="/disclaimer">Disclaimer（免責事項）</a>
</footer>
      </body>
    </html>
  );
}
