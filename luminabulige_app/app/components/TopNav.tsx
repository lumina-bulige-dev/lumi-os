// app/components/TopNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/cia", label: "CIA" },
  { href: "/beta", label: "Beta" },
  { href: "/compare", label: "Compare" },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="lumi-header">
      <Link href="/" className="text-lg font-semibold tracking-[0.18em] text-white">
  LUMINA
</Link>

      <nav className="lumi-nav" aria-label="Primary">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`lumi-nav-item ${active ? "is-active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
