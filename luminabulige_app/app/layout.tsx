// app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";
import { TopNav } from "./TopNav"; // 置いた場所に合わせてパス調整

export const metadata = {
  title: "LUMINA",
  description: "LUMINA / Cross-border fees made visible.",
};


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-slate-950 text-slate-50">
        <header className="lumi-header">
          <Link href="/" className="lumi-logo">
            LUMINA
          </Link>
          <nav className="lumi-nav">
            <Link href="/cia" className="lumi-nav-item">
              CIA
            </Link>
            <Link href="/beta" className="lumi-nav-item">
              Beta
            </Link>
            <Link href="/compare" className="lumi-nav-item">
              Compare
            </Link>
          </nav>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
