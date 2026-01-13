import { ui } from "../ui";

export const resultPalette = {
  OK: {
    color: ui.color.ok,
    bg: ui.color.okBg,
    br: "#A7F3D0",
  },
  NG: {
    color: "#F97316",
    bg: "rgba(251,146,60,0.16)",
    br: "#FED7AA",
  },
  REVOKED: {
    color: "#DC2626",
    bg: "rgba(220,38,38,0.16)",
    br: "#FECACA",
  },
  UNKNOWN: {
    color: "#64748B",
    bg: "rgba(100,116,139,0.16)",
    br: "#CBD5E1",
  },
} as const;

export type Result = keyof typeof resultPalette;

