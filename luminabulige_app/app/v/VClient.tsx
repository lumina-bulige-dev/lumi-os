"use client";

import { useSearchParams } from "next/navigation";

export default function VClient() {
  const sp = useSearchParams();
  const token = sp.get("token");
  return <div>{token ? `token=${token}` : "no token"}</div>;
}
