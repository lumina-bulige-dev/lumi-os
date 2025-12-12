import { HomeState } from "./types";

export function toHomeUiState(state: HomeState) {
  return {
    balanceText: `¥${state.balance_total.toLocaleString()}`,
    paketText: `¥${state.paket_bigzoon.toLocaleString()}`,
    floorLabel: state.floor_status,
    riskLabel: state.heart.risk_mode,
  };
}
