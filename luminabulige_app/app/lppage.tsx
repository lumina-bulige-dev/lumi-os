// app/lppage.tsx
import Link from "next/link";

const lumipalla_svg = (
  <svg
    width="100%"
    height="320"
    viewBox="0 0 900 320"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="World A から World B へジャンプする LUMINA の概念図"
    style={{ maxWidth: 900, display: "block" }}
  >
    <style>{`
      .box {
        fill: rgba(255,255,255,0.06);
        stroke: rgba(255,255,255,0.22);
        stroke-width: 1.5;
      }
      .title {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-size: 16px;
        font-weight: 700;
        fill: rgba(234,242,255,0.95);
      }
      .body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-size: 13px;
        fill: rgba(234,242,255,0.78);
      }
      .label {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-size: 12px;
        font-weight: 600;
        fill: rgba(234,242,255,0.75);
      }
      .arrow {
        stroke: rgba(234,242,255,0.7);
        stroke-width: 1.5;
        marker-end: url(#arrowHead);
        fill: none;
      }
    `}</style>

    <defs>
      <marker id="arrowHead" orient="auto" markerWidth="6" markerHeight="6" refX="5" refY="3">
        <path d="M0,0 L0,6 L6,3 z" fill="rgba(234,242,255,0.75)" />
      </marker>
    </defs>

    <text className="label" x="40" y="30">
      お金と仲の悪い現実世界から、“改善の軌跡が信用になる”並行世界へジャンプするポータルが LUMINA。
    </text>

  <g transform="translate(40,60)">
      <rect className="box" width="260" height="200" rx="14" ry="14" />
      <text className="title" x="20" y="30">🌍 World A：現実のお金レイヤー</text>
      <text className="body" x="20" y="60">・給料が入る → 気づけば消えている</text>
      <text className="body" x="20" y="85">・家計簿は“記録”だけで終わる</text>
      <text className="body" x="20" y="110">・「なぜ減るのか」が見えない</text>
      <text className="body" x="20" y="135">・信用スコアにはほぼ映らない</text>
    </g>

    <g transform="translate(330,80)">
      <rect className="box" width="240" height="160" rx="14" ry="14" />
      <text className="title" x="20" y="30">🌀 Portal：LUMINA Layer</text>
      <text className="body" x="20" y="60">・行動ログ × 支出を接続</text>
      <text className="body" x="20" y="85">・改善の履歴を Trast に保存</text>
      <text className="body" x="20" y="110">・変化量を BULIG Rank で数値化</text>
      <text className="body" x="20" y="135">・CIA / oKYC に束ねて“信用の素材”へ</text>
    </g>

    <g transform="translate(610,60)">
      <rect className="box" width="260" height="200" rx="14" ry="14" />
      <text className="title" x="20" y="30">🌎 World B：信用の並行レイヤー</text>
      <text className="body" x="20" y="60">・お金との関係を“やり直した軌跡”が残る</text>
      <text className="body" x="20" y="85">・Rank +1 でも「前よりマシ」が見える</text>
      <text className="body" x="20" y="110">・家・仕事・契約で出せる材料になる</text>
      <text className="body" x="20" y="135">・「変われる人」という信用の前置き資料</text>
    </g>

    <line className="arrow" x1="300" y1="160" x2="330" y2="160" />
    <text className="label" x="285" y="145">分析・改善へ</text>

    <line className="arrow" x1="570" y1="160" x2="610" y2="160" />
    <text className="label" x="555" y="145">信用の素材へ</text>
  </svg>
);

export default function LPPage() {
  return (
    <main>
      <section className="lp-hero">
  <h1>
    お金と仲直りするための並行世界ウォレット
    <br />
    LUMINA CIA / oKYC β
  </h1>

  <p className="lead">
    ただの家計簿で終わらせない。行動ログ × oKYC × 改ざん検知で、
    「お金との関係をやり直した軌跡」を信用の素材に変える。
  </p>
</section>

        <div className="hero-cta">
          <Link href="/beta" className="primary-cta">
            β版を触ってみる
          </Link>
          <a href="#concept" className="secondary-cta">
            Worldコンセプト
          </a>
        </div>

        <p className="hero-badge">
          招待制 β版 / OpenAI 月3,000円から始まった個人発 Fintech 実験
        </p>
      </section>

      <section id="problem">
        <h2>「ちゃんとしてるのに、信用で詰む人」が多すぎる。</h2>
        <p>
          在日外国人、海外在住日本人、転職や移住の多い人たち。
          <br />
          人としてはちゃんとしているのに、「日本での実績がないから」「スコアがないから」という理由だけで、
          <br />
          家、クレジットカード、契約のスタートラインにすら立てないことがあります。
        </p>
      </section>

      <section id="parallel-world">
        <h2 id="concept">もうひとつの並行世界で、「やり直した信用」を育てる。</h2>
        <div style={{ marginTop: 16, marginBottom: 8 }}>{lumipalla_svg}</div>
        <p className="concept-line">LUMINA は、🌍から🌎へジャンプするためのポータルです。</p>
      </section>

      <section id="beta">
        <h2>今はまだ β版です。</h2>
        <div className="hero-cta">
          <Link href="/cia" className="secondary-cta">CIA</Link>
          <Link href="/beta" className="primary-cta">Beta</Link>
          <Link href="/compare" className="secondary-cta">Compare</Link>
        </div>
      </section>
    </main>
  );
}
