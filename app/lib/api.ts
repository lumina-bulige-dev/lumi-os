import { HomeState } from "./types";

const WORKER_BASE = "https://api.luminabulige.com";

type WiseLinkResponse = {
  url?: string;
  wise_referral_url?: string;
};

export async function fetchHomeState(): Promise<HomeState> {
  const res = await fetch(
    `${WORKER_BASE}/api/v1/core/home_state`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("API error");
  return res.json();
}

export async function fetchWiseReferral(): Promise<WiseLinkResponse> {
  const res = await fetch(
    `${WORKER_BASE}/api/v1/links/wise`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("API error");
  return res.json();
}

export const fetchWiseLink = fetchWiseReferral;
