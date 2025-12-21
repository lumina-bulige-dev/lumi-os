export type Level = "SAFE" | "WARNING" | "DANGER";

export function calcLevel(balance: number, floor: number): Level {
  if (balance >= floor * 1.2) return "SAFE";
  if (balance >= floor) return "WARNING";
  return "DANGER";
}
