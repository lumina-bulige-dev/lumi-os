// app/TopNav.tsx
"use client";

import Link from "next/link";

export function TopNav() {
  return (
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
  );
}
