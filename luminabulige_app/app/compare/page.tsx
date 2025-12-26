// app/compare/page.tsx
import { getDefaultRules } from "../lib/lumiRules";

const V = 480_000; // 年間取引額のモック

export default function ComparePage() {
  const ruleset = getDefaultRules();
  const matched = ruleset.rules.find(
    (r) => !r.annualVolumeMax || V <= r.annualVolumeMax
  );

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Compare / ボリューム位置づけ</h1>
      <p className="text-sm text-slate-300">
        年間取引額 V={V.toLocaleString()} 円 が、
        LUMIのSAFE / WARNING / DANGERどこに入るかのモック表示です。
      </p>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm space-y-2">
        <p className="text-slate-400">
          ルールセット: <code>{ruleset.id}</code> ({ruleset.version})
        </p>

        {matched ? (
          <div>
            <p className="text-slate-200">
              このボリュームは <span className="font-semibold">{matched.level}</span>{" "}
              レンジに入っています。
            </p>
            <p className="text-slate-300 mt-1">{matched.label}</p>
            {matched.note && (
              <p className="text-xs text-slate-400 mt-1">{matched.note}</p>
            )}
          </div>
        ) : (
          <p className="text-rose-300">
            どのレンジにもマッチしませんでした（ルール設定を見直し）。
          </p>
        )}
      </div>
    </section>
  );
}
