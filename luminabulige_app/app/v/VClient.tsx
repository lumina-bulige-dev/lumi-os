// app/v/VClient.tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function VClient() {
  const sp = useSearchParams();
  const proofId = sp.get("proofId");

  return (
    <div>
      <h1>/v</h1>
      <div>proofId: {proofId ?? "-"}</div>
    </div>
  );
}
