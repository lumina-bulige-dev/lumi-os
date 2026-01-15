// pages/docs/[slug].tsx
import { useRouter } from 'next/router';
import React from 'react';

export default function DocumentPage() {
  const router = useRouter();
  const { slug } = router.query;

  // slug 未確定の初期表示を回避
  if (!slug) return null;

  const fileName = Array.isArray(slug) ? slug[0] : slug;
  const fileExt = fileName.split('.').pop()?.toLowerCase();

  // PDFの場合はiframeで表示
  if (fileExt === 'pdf') {
    return (
      <main className="p-4">
        <h1 className="text-xl font-bold mb-4">{fileName}</h1>
        <iframe
          src={`/docs/${fileName}`}
          style={{ width: '100%', height: '80vh', border: 'none' }}
        />
      </main>
    );
  }

  // テキスト/HTMLはfetchして表示
  const [content, setContent] = React.useState<string | null>(null);
  React.useEffect(() => {
    fetch(`/docs/${fileName}`)
      .then((res) => res.text())
      .then(setContent)
      .catch((err) => setContent(`読み込みに失敗しました: ${err.message}`));
  }, [fileName]);

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">{fileName}</h1>
      {content === null ? (
        <p>読み込み中...</p>
      ) : (
        <pre className="whitespace-pre-wrap break-all">{content}</pre>
      )}
    </main>
  );
}
