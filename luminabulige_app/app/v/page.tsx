import { Suspense } from "react";
import VClient from "./VClient";

export const dynamic = "force-dynamic"; // ← これも入れる

export default function Page() {
  return (
    <Suspense fallback={null}>
      <VClient />
    </Suspense>
  );
}
