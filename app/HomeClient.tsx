"use client";

import { useEffect, useState } from "react";


export default function HomeClient() {
  const [state, setState] = useState<any>(null);

  useEffect(() => {
    fetchHomeState().then(setState).catch(console.error);
  }, []);

  const openWise = async () => {
    const data = await fetchWiseLink();
    const url = data.url ?? data.wise_url ?? data.wiseUrl;
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!state) return <p>Loading...</p>;
  // 以下 state を使って描画
}
