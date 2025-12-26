// app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";
import { TopNav } from "./components/TopNav"; // ← ここを変更

export const metadata = {
  title: "LUMINA",
  description: "LUMINA / Cross-border fees made visible.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-slate-950 text-slate-50">
        <TopNav />
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
