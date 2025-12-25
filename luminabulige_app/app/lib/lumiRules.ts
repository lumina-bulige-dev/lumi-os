

export type Level = "SAFE" | "WARNING" | "DANGER";
// 名前だけあなたのファイルに合わせて変えて
export function getDefaultRules() {
  return type Level; // とか RULES とか
}
export function calcLevel(balance: number, floor: number): Level {
  if (balance >= floor * 1.2) return "SAFE";
  if (balance >= floor) return "WARNING";
  return "DANGER";
}
