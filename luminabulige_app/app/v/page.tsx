// app/v/page.tsx
import { Suspense } from 'react';
import VClient from './VClient';

export const dynamic = 'force-dynamic'; // 念のため静的化回避
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <VClient />
    </Suspense>
  );
}
