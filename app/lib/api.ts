import { HomeState } from "./types";

export async function fetchHomeState(): Promise<HomeState> {
  const res = await fetch("/api/v1/core/home_state");
  if (!res.ok) throw new Error("HOME_STATE_FETCH_FAILED");
  return res.json();
}

async function openWise() {
  try {
    const res = await fetch("/api/v1/links/wise");
    if (!res.ok) throw new Error();

    const { url } = await res.json();
    window.location.href = url;
  } catch {
    showError("Wise の画面を開けませんでした。時間をおいて再度お試しください。");
  }
}
