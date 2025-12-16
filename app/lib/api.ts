import { HomeState } from "./types";


const WORKER_BASE = "https://api.luminabulige.com";

export async function fetchHomeState(): Promise<HomeState> {
  const res = await fetch(`${WORKER_BASE}/api/v1/core/home_state`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchHomeState() {
  const res = await fetch("/api/home_state", { cache: "no-store" });
  if (!res.ok) throw new Error("fetchHomeState failed");
  return res.json();

export async function fetchWiseLink() {
  const res = await fetch(`${WORKER_BASE}/api/v1/links/wise`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ↓ これらは削除（AppはWorker直叩きで統一）
// export async function fetchHomeState() { ... }
// export async function fetchWiseReferral() { ... }
