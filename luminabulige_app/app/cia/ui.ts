export const ui = {
  color: {
    border: "rgba(255,255,255,0.16)",
    text: "rgba(234,242,255,0.92)",
    weak: "rgba(234,242,255,0.62)",

    // 追加（VClient.tsx が参照してる）
    soft: "rgba(255,255,255,0.06)",
    ok: "#0B5FFF",
    okBg: "rgba(11,95,255,0.14)",
  },
  shadow: {
    soft: "0 10px 30px rgba(0,0,0,0.35)",
  },
  radius: {
    pill: 999,
  },
} as const;
