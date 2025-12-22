// app/v/page.tsx
import { Suspense } from "react";
import VClient from "./VClient";

export default function VPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
      <VClient />
    </Suspense>
  );
}
