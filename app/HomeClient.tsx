"use client";

import { fetchWiseReferral } from "./lib/api";

export default function HomeClient() {
  const openWise = async () => {
    try {
      const { url } = await fetchWiseReferral();
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      alert("Wiseリンクの取得に失敗しました");
      console.error(e);
    }
  };

  return (
    <button
      onClick={openWise}
      style={{
        padding: "12px 16px",
        borderRadius: 8,
        background: "#d4b15f",
        color: "#000",
        fontWeight: 600,
      }}
    >
      Wise 手数料を見る
    </button>
  );
}
