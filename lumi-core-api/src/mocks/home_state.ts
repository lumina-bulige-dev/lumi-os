// src/mocks/home_state.ts
export const MOCK_HOME_STATE = {
  safe: {
    balance_total: 320000,
    paket_bigzoon: 300000,
    floor_status: "SAFE",
    challenge: {
      day_in_challenge: 7,
      is_safe_null_today: true,
      safe_move_limit: 0,
    },
    heart: { risk_mode: "NORMAL" },
  },
  warning: {
    balance_total: 305000,
    paket_bigzoon: 300000,
    floor_status: "WARNING",
    challenge: {
      day_in_challenge: 15,
      is_safe_null_today: false,
      safe_move_limit: 5000,
    },
    heart: { risk_mode: "TIRED" },
  },
  danger: {
    balance_total: 298000,
    paket_bigzoon: 300000,
    floor_status: "DANGER",
    challenge: {
      day_in_challenge: 23,
      is_safe_null_today: false,
      safe_move_limit: 0,
    },
    heart: { risk_mode: "RED" },
  },
} as const;
