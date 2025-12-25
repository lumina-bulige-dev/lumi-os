// app/compare/page.tsx
import { getDefaultRules } from "../lib/lumiRules";
// import { lumiLoad } from "../lib/lumiStorage";

const V = 480_000; // 年間ボリューム仮置き

export default function ComparePage() {
  const ruleset = getDefaultRules();

  // ここで ruleset.rules を使って
  // V が SAFE / WARNING / DANGER のどこに入るか判定する、
  // みたいなロジックを書ける

  return (
    <main>
      {/* ここに CIA っぽい Compare ダッシュボード */}
    </main>
  );
}
