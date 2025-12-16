// app/HomeClient.tsx
"use client";

import HomeStateUi from "./components/HomeStateUi";
import { useEffect, useState } from "react";

import { fetchHomeState, fetchWiseLink } from "./lib/api";

type HomeState = {
  balance_total: number;
  paket_bigzoon: number;
  floor_status: "SAFE" | "WARNING" | "DANGER";
  heart: { risk_mode: string };
};

export default function HomeClient() {
  const [state, setState] = useState<HomeState | null>(null);

  useEffect(() => {
    fetchHomeState()
      .then((data) => {
        console.log("🔥 home_state", data);
        setState(data);
      })
      .catch(console.error);
  }, []);

  const openWise = async () => {
  try {
    const data = await fetchWiseLink();
    const url = data.url ?? data.wise_url ?? data.wiseUrl;
    if (!url) throw new Error("Wise URL missing");
    window.open(url, "_blank", "noopener,noreferrer");
  } catch (e) {
    alert("Wiseリンクの取得に失敗しました");
    console.error(e);
  }
};

  if (!state) return <p>Loading...</p>;

  const status = state.floor_status;

 return (
  <div className={`home-card ${status === "DANGER" ? "danger-bg" : ""}`}>
      <h2>
        <span className={`badge badge-${status.toLowerCase()}`}>
          {status}
        </span>
      </h2>

      <p>残高: ¥{Number(state.balance_total).toLocaleString()}</p>
      <p>床: ¥{Number(state.paket_bigzoon).toLocaleString()}</p>
      <p>リスク: {state.heart?.risk_mode}</p>

      <p className="hint">
        {status === "SAFE" && "床との余裕は十分あります。"}
        {status === "WARNING" && "床に近づいています。大きな支出に注意。"}
        {status === "DANGER" && "床スレスレです。今日は減速推奨。"}
      </p>

      <button
        onClick={openWise}
        style={{
          padding: "12px 16px",
          borderRadius: 8,
          background: "#d4b15f",
          color: "#000",
          fontWeight: 600,
          marginTop: 12,
        }}
      >
        Wise 手数料を見る
      </button>
    </div>
  );
}
