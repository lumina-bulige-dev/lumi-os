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
