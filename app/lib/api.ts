//import { HomeState } from "./types";
//const WORKER_BASE = "https://api.luminabulige.com";

/**
 * Home state は Worker を直叩き（正）
 */
//export async function fetchHomeState(): Promise<HomeState> {
//  const res = await fetch(`${WORKER_BASE}/api/v1/core/home_state`, {
//    cache: "no-store",
//  });
//  if (!res.ok) throw new Error(`API error: ${res.status}`);
//  return res.json();
//}
//
/**
 * Wise link も Worker 経由
 */
//export async function fetchWiseLink() {
//  const res = await fetch(`${WORKER_BASE}/api/v1/links/wise`, {
//    cache: "no-store",
//  });
//  if (!res.ok) throw new Error(`API error: ${res.status}`);
//  return res.json();
//}
