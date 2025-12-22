import { Suspense } from "react";
import VClient from "./VClient";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
      <VClient />
    </Suspense>
  );
}
