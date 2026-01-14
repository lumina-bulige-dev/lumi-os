// app/v/page.tsx
import { Suspense } from 'react';
import SearchParamsConsumer from './SearchParamsConsumer';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <SearchParamsConsumer />
    </Suspense>
  );
}

// app/v/SearchParamsConsumer.tsx
'use client';
import { useSearchParams } from 'next/navigation';

export default function SearchParamsConsumer() {
  const params = useSearchParams();
  // … ここで params を使う処理 …
}

