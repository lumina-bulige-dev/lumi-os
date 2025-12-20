import Link from "next/link";

export default function BetaPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>30日ベータについて</h1>
      <p>現在はβ版です。比較機能を優先して提供しています。</p>
      <Link href="/compare">今すぐ比較する</Link>
    </main>
  );
}
