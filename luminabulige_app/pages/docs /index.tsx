// pages/docs/index.tsx (Next.js Pages Routerの場合)
import fs from 'fs';
import path from 'path';
import Link from 'next/link';

interface DocItem {
  name: string;
  slug: string;
}

export async function getStaticProps() {
  const docsDir = path.join(process.cwd(), 'public/docs');
  const files = fs.readdirSync(docsDir);
  const docs: DocItem[] = files.map((file) => ({
    name: file,
    slug: encodeURIComponent(file),
  }));
  return { props: { docs } };
}

export default function DocsIndex({ docs }: { docs: DocItem[] }) {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold mb-4">ドキュメント一覧</h1>
      <ul className="list-disc pl-4 space-y-2">
        {docs.map((doc) => (
          <li key={doc.slug}>
            <Link href={`/docs/${doc.slug}`} className="text-blue-500 underline">
              {doc.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
