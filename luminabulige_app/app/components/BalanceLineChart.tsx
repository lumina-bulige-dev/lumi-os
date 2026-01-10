type Point = { ts: number; v: number };

export default function BalanceLineChart({
  points,
  height = 160,
}: {
  points: Point[];
  height?: number;
}) {
  const w = 640;          // viewBox幅（固定でOK）
  const h = height;
  const pad = 18;

  const xs = points.map((_, i) => i);
  const ys = points.map((p) => p.v);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const dx = maxX - minX || 1;
  const dy = maxY - minY || 1;

  const sx = (i: number) => pad + ((i - minX) / dx) * (w - pad * 2);
  const sy = (v: number) => (h - pad) - ((v - minY) / dy) * (h - pad * 2);

  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${sx(i).toFixed(2)} ${sy(p.v).toFixed(2)}`)
    .join(" ");

  const last = points[points.length - 1];

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
      <div className="flex items-baseline justify-between">
        <div className="text-sm font-semibold text-slate-200">累積支出（怖いけど真実）</div>
        <div className="text-xs text-slate-400">
          最新: ¥ {Math.round(last.v).toLocaleString("ja-JP")}
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border border-white/10 bg-slate-950/60">
        <svg viewBox={`0 0 ${w} ${h}`} className="block h-[160px] w-full">
          {/* grid */}
          <g opacity="0.25">
            {Array.from({ length: 6 }).map((_, i) => {
              const y = pad + (i * (h - pad * 2)) / 5;
              return <line key={i} x1={pad} y1={y} x2={w - pad} y2={y} stroke="currentColor" />;
            })}
          </g>

          {/* line */}
          <path d={d} fill="none" stroke="currentColor" strokeWidth="3" className="text-rose-300" />

          {/* last dot */}
          <circle
            cx={sx(points.length - 1)}
            cy={sy(last.v)}
            r="5"
            className="fill-rose-200"
          />
        </svg>
      </div>

      <div className="mt-2 text-[11px] text-slate-400">
        ※ 支出だけを累積。入金は別ラインにするなら増やせる。
      </div>
    </div>
  );
}
