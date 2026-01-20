export type AzrEvent = {
  type: "SYSTEM" | "OPERATOR";
  name: string;
  occurredAt: string;
  payload?: Record<string, unknown>;
};

export const SYSTEM_EVENT_NAMES = [
  "decision_requested",
  "decision_recorded",
  "badge_issued",
] as const;
