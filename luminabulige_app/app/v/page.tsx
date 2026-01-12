// app/v/page.tsx
"use client";
import { Suspense } from "react";
import VClient from "./VClient"; // VClient が default export の想定

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <VClient />
    </Suspense>
  );
}

// 以前の VerifyPage は名前付きで残す（必要なら）
export function VerifyPageStandalone() {
  // 既存ロジックをここに移す（useSearchParams 等）
  return <div>Standalone Verify</div>;
}
