// app/layout.tsx
import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = {
  title: "LUMINA",
  description: "LUMINA / Cross-border fees made visible.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-slate-950 text-slate-50">
        <header className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="text-lg font-semibold tracking-[0.2em] text-slate-100"
          >
            LUMINA
          </Link>
          <nav className="flex gap-4 text-sm text-slate-300">
            <Link href="/cia">CIA</Link>
            <Link href="/beta">Beta</Link>
            <Link href="/compare">Compare</Link>
          </nav>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
