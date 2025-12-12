export type HomeState = {
  balance_total: number;
  paket_bigzoon: number;
  floor_status: "SAFE" | "WARNING" | "DANGER";
  challenge: {
    day_in_challenge: number;
    is_safe_null_today: boolean;
    safe_move_limit: number;
  };
  heart: {
    risk_mode: "NORMAL" | "TIRED" | "RED";
  };
};
