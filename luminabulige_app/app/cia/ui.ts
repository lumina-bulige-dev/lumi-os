export const ui = {
  color: {
    bg: "#050A14",

    border: "rgba(255,255,255,0.16)",
    text: "rgba(234,242,255,0.92)",
    weak: "rgba(234,242,255,0.62)",
    sub: "rgba(234,242,255,0.62)",
    soft: "rgba(255,255,255,0.06)",

    ok: "#0B5FFF",
    okBg: "rgba(11,95,255,0.14)",

    // 🔴 これを「必ず color の中」に入れる
    ng: "#9A3412",
    ngBg: "#FFF7ED",

    rev: "#EF4444",
    revBg: "rgba(239,68,68,0.14)",

    link: "#46B6FF",
  },

  space: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },

  font: {
    ui: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },

  shadow: {
    soft: "0 10px 30px rgba(0,0,0,0.35)",
    card: "0 10px 30px rgba(0,0,0,0.35)",
  },

  radius: {
    md: 12,
    lg: 16,
    pill: 999,
  },
} as const;
