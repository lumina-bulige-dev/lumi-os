import { HomeState } from "./types";

const WORKER_BASE = "https://luminabulige.com";

export async function fetchHomeState(): Promise<HomeState> {
  const res = await fetch(
    `${WORKER_BASE}/api/v1/core/home_state`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("API error");
  return res.json();
}

export async function fetchWiseLink() {
  const res = await fetch(
    `${WORKER_BASE}/api/v1/links/wise_affiliate`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("API error");
  return res.json();
}
