import { HomeState } from "./types";

const WORKER_BASE = "https://api.luminabulige.com";

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
    `${WORKER_BASE}/api/v1/links/wise`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("API error");
  return res.json();
}

export async function fetchWiseReferral(): Promise<{ url: string }> {
  const res = await fetch("/api/wise-referral", { cache: "no-store" });
  if (!res.ok) throw new Error(`fetchWiseReferral failed: ${res.status}`);
  return res.json();
}
