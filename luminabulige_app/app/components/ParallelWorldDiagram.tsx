export default function ParallelWorldDiagram() {
  return (
    <svg
      width="100%"
      height="320"
      viewBox="0 0 900 320"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="World AからWorld Bへ。LUMINAがポータルになる図"
    >
      <style>{`
        .box { fill:#ffffff; stroke:#222; stroke-width:1.5; }
        .title { font-family: system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; font-size:16px; font-weight:700; }
        .body { font-family: system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; font-size:13px; }
        .label { font-family: system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; font-size:12px; font-weight:600; }
        .arrow { stroke:#222; stroke-width:1.5; marker-end:url(#arrowHead); fill:none; }
      `}</style>

      <defs>
        <marker id="arrowHead" orient="auto" markerWidth="6" markerHeight="6" refX="5" refY="3">
          <path d="M0,0 L0,6 L6,3 z" />
        </marker>
      </defs>

      {/* World A */}
      <g transform="translate(40,60)">
        <rect className="box" width="260" height="200" rx="14" ry="14" />
        <text className="title" x="20" y="30">🌍 World A：現実のお金レイヤー</text>
        <text className="body" x="20" y="60">・給料が入る → 気づけば消えている</text>
        <text className="body" x="20" y="85">・家計簿は“記録”だけで終わる</text>
        <text className="body" x="20" y="110">・「なぜ減るのか」が見えない</text>
        <text className="body" x="20" y="135">・信用スコアにはほぼ映らない</text>
      </g>

      {/* Portal */}
      <g transform="translate(330,80)">
        <rect className="box" width="240" height="160" rx="14" ry="14" />
        <text className="title" x="20" y="30">🌀 Portal：LUMINA Layer</text>
        <text className="body" x="20" y="60">・行動ログ × 支出を接続</text>
        <text className="body" x="20" y="85">・改善の履歴を Trast に保存</text>
        <text className="body" x="20" y="110">・変化量を BULIG Rank で数値化</text>
        <text className="body" x="20" y="135">・CIA / oKYC に束ねて“信用の素材”へ</text>
      </g>

      {/* World B */}
      <g transform="translate(610,60)">
        <rect className="box" width="260" height="200" rx="14" ry="14" />
        <text className="title" x="20" y="30">🌎 World B：信用の並行レイヤー</text>
        <text className="body" x="20" y="60">・お金との関係を“やり直した軌跡”が残る</text>
        <text className="body" x="20" y="85">・Rank +1 でも「前よりマシ」が見える</text>
        <text className="body" x="20" y="110">・家・仕事・契約で出せる材料になる</text>
        <text className="body" x="20" y="135">・「変われる人」という信用の前置き資料</text>
      </g>

      {/* Arrows */}
      <line className="arrow" x1="300" y1="160" x2="330" y2="160" />
      <text className="label" x="295" y="145">分析・改善へ</text>

      <line className="arrow" x1="570" y1="160" x2="610" y2="160" />
      <text className="label" x="565" y="145">信用の素材へ</text>

      {/* Caption */}
      <text className="label" x="40" y="30">
        お金と仲の悪い現実世界から、“改善の軌跡が信用になる”並行世界へジャンプするポータルが LUMINA。
      </text>
    </svg>
  );
}
