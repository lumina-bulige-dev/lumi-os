// app/TopNav.tsx か app/components/TopNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/cia", label: "CIA" },
  { href: "/beta", label: "Beta" },
  { href: "/compare", label: "Compare" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
      <Link
        href="/"
        className="text-lg font-semibold tracking-[0.25em] text-slate-100"
      >
        LUMINA
      </Link>

      <nav className="flex gap-3 text-sm">
        {TABS.map((tab) => {
          const isActive =
            pathname === tab.href || (tab.href === "/cia" && pathname === "/");

          const base =
            "rounded-full border px-5 py-1.5 transition-colors duration-150";
          const active =
            "border-yellow-400 bg-slate-950 text-slate-50 shadow-[0_0_0_1px_rgba(250,204,21,0.3)]";
          const inactive =
            "border-slate-600/70 bg-slate-900/60 text-slate-300 hover:border-slate-200 hover:text-slate-50";

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`${base} ${isActive ? active : inactive}`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
