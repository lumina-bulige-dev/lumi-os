// app/lib/homeState.ts

// Worker の /api/v1/core/home_state 用の型
export type HomeState = {
  balance_total: number;
  paket_bigzoon: number;
  floor_status: "SAFE" | "WARNING" | "DANGER";
  challenge: {
    day_in_challenge: number;
    is_safe_null_today: boolean;
    safe_move_limit: number;
  };
  heart: {
    risk_mode: "NORMAL" | "TIRED" | "RED";
  };
};

// Wise 紹介 URL 用の型
export type WiseReferral = {
  wise_referral_url: string;
};

// HOME 状態を Cloudflare Worker から取ってくる
export async function fetchHomeState(): Promise<HomeState> {
  const res = await fetch(
    "https://luminabulige.com/api/v1/core/home_state",
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch home_state");
  }

  return (await res.json()) as HomeState;
}

// Wise 紹介 URL を取ってくる
export async function fetchWiseReferral(): Promise<WiseReferral> {
  const res = await fetch("https://luminabulige.com/wise-referral", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch wise-referral");
  }

  return (await res.json()) as WiseReferral;
}
