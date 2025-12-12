import { HomeState } from "./types";
const WORKER_BASE =
  "https://<luminabulige.com＞";

export async function fetchHomeState() {
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
  return res.json();
}
