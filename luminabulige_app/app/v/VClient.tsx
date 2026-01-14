"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

export default function VClient() {
  const sp = useSearchParams();
  const proofId = useMemo(() => sp.get("proofId") || "", [sp]);

  // 以下そのまま
}
