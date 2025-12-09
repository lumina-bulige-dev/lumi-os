// lib/homeState.ts

export type FloorStatus = "SAFE" | "WARNING" | "DANGER";

export type HomeState = {
  balance_total: number;
  paket_bigzoon: number;
  floor_status: FloorStatus;
  challenge: {
    day_in_challenge: number;
    is_safe_null_today: boolean;
    safe_move_limit: number;
  };
  heart: {
    risk_mode: string; // "NORMAL" | "TIRED" | "RED" など
  };
};

const HOME_STATE_ENDPOINT =
  "https://luminabulige.com/api/v1/core/home_state";

export async function fetchHomeState(
  mock?: "safe" | "warning" | "danger"
): Promise<HomeState> {
  const url = new URL(HOME_STATE_ENDPOINT);

  if (mock) {
    url.searchParams.set("mock", mock);
  }

  const res = await fetch(url.toString(), {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(`home_state fetch failed: ${res.status}`);
  }

  return (await res.json()) as HomeState;
}
