// app/lib/homeStateUi.ts
import type { HomeState } from "./homeState";

export type HomeUiState = {
  balanceText: string;
  paketText: string;
  floorLabel: string;
  floorColor: "green" | "yellow" | "red";
  riskLabel: string;
};

export function toHomeUiState(state: HomeState): HomeUiState {
  // 残高表示（とりあえず日本語・円で）
  const balanceText = `${state.balance_total.toLocaleString()} 円`;
  const paketText = `${state.paket_bigzoon.toLocaleString()} 円`;

  let floorLabel = "";
  let floorColor: "green" | "yellow" | "red" = "green";

  switch (state.floor_status) {
    case "SAFE":
      floorLabel = "今日は SAFE ゾーン";
      floorColor = "green";
      break;
    case "WARNING":
      floorLabel = "WARNING：ちょい使いすぎ注意";
      floorColor = "yellow";
      break;
    case "DANGER":
      floorLabel = "DANGER：今日は SAFE_NULL 推奨";
      floorColor = "red";
      break;
  }

  let riskLabel = "";
  switch (state.heart.risk_mode) {
    case "NORMAL":
      riskLabel = "通常モード";
      break;
    case "TIRED":
      riskLabel = "疲れモード（慎重に）";
      break;
    case "RED":
      riskLabel = "RED モード（原則 SAFE_NULL）";
      break;
  }

  return {
    balanceText,
    paketText,
    floorLabel,
    floorColor,
    riskLabel,
  };
}
