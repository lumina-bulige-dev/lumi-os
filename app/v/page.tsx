import { Suspense } from "react";
import { VClient } from "@features/verify";

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <VClient />
    </Suspense>
  );
}

