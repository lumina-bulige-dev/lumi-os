function badgeStyle(result: Result) {
  const palette = {
    OK:      { color: ui.color.ok,        bg: ui.color.okBg,             br: "#A7F3D0" },
    NG:      { color: "#F97316",          bg: "rgba(251,146,60,0.16)",   br: "#FED7AA" },
    REVOKED: { color: "#EF4444",          bg: "rgba(239,68,68,0.16)",    br: "#FECACA" },
    UNKNOWN: { color: "#94A3B8",          bg: "rgba(148,163,184,0.16)",  br: ui.color.border },
  } as const;
  const p = palette[result];
  return { color: p.color, background: p.bg, border: `1px solid ${p.br}` };
}

export const ui = {
  color: {
    link: "#46B6FF",
    bg: "#050A14",
    border: "rgba(255,255,255,0.16)",
    text: "rgba(234,242,255,0.92)",
    weak: "rgba(234,242,255,0.62)",
    sub: "rgba(234,242,255,0.62)",
    soft: "rgba(255,255,255,0.06)",
    ok: "#0B5FFF",
    okBg: "rgba(11,95,255,0.14)",
 color: {
    // ...（既存のカラー定義）...
    ok: '#22C55E',         // 例: 良好（緑系） - 定義済みと仮定
    okBg: '#DCFCE7',       // 例: 良好の背景（淡い緑）
    /** ↓不足していたカラー定義を追加 ↓ **/
    rev: '#F97316',        // 要確認状態（オレンジ系の警告色）
    revBg: '#FFEDD5',      // 要確認状態の背景色（薄いオレンジ）
    ng: '#EF4444',         // NG状態（問題あり・エラー時の赤色）
    ngBg: '#FEE2E2',       // NG状態の背景色（薄い赤）
    unknown: '#6B7280',    // 不明・未判定状態（中間的なグレー）
    unknownBg: '#F3F4F6',  // 不明状態の背景色（薄いグレー）
    // ...（他のカラー定義が続く）...
  },
    // 追加 ↓
    ng:  "#F97316",
    ngBg: "rgba(251,146,60,0.16)",
    rev: "#EF4444",
    revBg: "rgba(239,68,68,0.16)",
    unk: "#94A3B8",
    unkBg: "rgba(148,163,184,0.16)",
  },
  // 他は既存のまま
} as const;

// もし Color 型などがある場合
type UIColor = {
  link:string; bg:string; border:string; text:string; weak:string; sub:string; soft:string;
  ok:string; okBg:string;
  ng:string; ngBg:string; rev:string; revBg:string; unk:string; unkBg:string; // ←追記
};
