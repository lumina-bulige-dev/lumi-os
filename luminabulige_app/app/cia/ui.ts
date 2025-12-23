export const ui = {
    color: {
  bg: "#050A14",          // 例：今のデザインに合わせる
  // 既存
  border: "rgba(255,255,255,0.16)",
  text: "rgba(234,242,255,0.92)",
  weak: "rgba(234,242,255,0.62)",
  sub: "rgba(234,242,255,0.62)",
  soft: "rgba(255,255,255,0.06)",
  ok: "#0B5FFF",
  okBg: "rgba(11,95,255,0.14)",
  link: "#46B6FF",
},
 font: {
    mono:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  // ...
  shadow: {
    soft: "0 10px 30px rgba(0,0,0,0.35)",
    card: "0 10px 30px rgba(0,0,0,0.35)", // もし card 参照があるならついでに
  },

  radius: {
    lg: 16,     // 追加（VClient.tsx:223 が参照）
    pill: 999,
  },
  
} as const;
