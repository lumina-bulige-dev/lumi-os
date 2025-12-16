"use client";

import { fetchWiseReferral } from "./lib/api";
import { toHomeUiState } from "./lib/mapper";
import { HomeState } from "./lib/types";

type Props = {
  state: HomeState;
};

export default function HomeClient({ state }: Props) {
  const openWise = async () => {
    try {
      const { url, wise_referral_url } = await fetchWiseReferral();
      // API currently returns `url`; `wise_referral_url` remains for older affiliates.
      const targetUrl = url ?? wise_referral_url;
      if (!targetUrl) throw new Error("No URL available in Wise link response");
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      alert("Wiseリンクの取得に失敗しました");
      console.error(e);
    }
  };

  const status = state.floor_status;
  const ui = toHomeUiState(state);

 return (
  <div className={`home-card ${status === "DANGER" ? "danger-bg" : ""}`}>
      <h2>
        <span className={`badge badge-${status.toLowerCase()}`}>
          {status}
        </span>
      </h2>

      <p>残高: {ui.balanceText}</p>
      <p>床: {ui.paketText}</p>
      <p>リスク: {ui.riskLabel}</p>

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
