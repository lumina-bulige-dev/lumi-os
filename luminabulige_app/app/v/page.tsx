import { Suspense } from "react";
import VClient from "./VClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VClient />
    </Suspense>
  );
}

