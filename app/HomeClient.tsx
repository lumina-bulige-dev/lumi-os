"use client";

import { useState } from "react";
import { fetchWiseReferral } from "./lib/api";
import { HomeState } from "./lib/types";

type HomeClientProps = {
  initialState: HomeState;
};

export default function HomeClient({ initialState }: HomeClientProps) {
  const [state] = useState<HomeState>(initialState);

  const openWise = async () => {
    try {
      const { url } = await fetchWiseReferral();
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
