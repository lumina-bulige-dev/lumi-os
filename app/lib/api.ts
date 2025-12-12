import { HomeState } from "./types";

export async function fetchHomeState(): Promise<HomeState> {
  const res = await fetch("/api/v1/core/home_state");
  if (!res.ok) throw new Error("HOME_STATE_FETCH_FAILED");
  return res.json();
}

export async function fetchWise(): Promise<{ url: string }> {
  const res = await fetch("/api/v1/links/wise");
  if (!res.ok) throw new Error("WISE_LINK_FETCH_FAILED");
  return res.json();
}
