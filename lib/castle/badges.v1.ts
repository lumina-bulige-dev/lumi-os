export const BADGE_MASTER = {
  KABUTO_PREMIUM: {
    ver: 1,
    title: "兜武将",
    rarity: 5,
    note: "価値・信用を与えません。改ざん検知の履歴として残るだけです。",
  },
  NINJA: {
    ver: 1,
    title: "忍者",
    rarity: 4,
    note: "価値・信用を与えません。改ざん検知の履歴として残るだけです。",
  },
} as const;

export type BadgeId = keyof typeof BADGE_MASTER;
