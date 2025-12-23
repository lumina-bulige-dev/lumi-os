// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>LUMINA</h1>
      <ul style={{ lineHeight: 2 }}>
        <li><Link href="/cia">CIA Report</Link></li>
        <li><Link href="/beta">Beta</Link></li>
        <li><Link href="/compare">Compare</Link></li>
      </ul>
    </main>
  );
}
