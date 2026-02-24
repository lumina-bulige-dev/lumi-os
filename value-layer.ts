/**
 * Value Layer
 * 個人の意図・価値・優先度を抽象化する層
 */

export interface LightValue {
  intent: string;          // 例: "send-message", "sync-state"
  priority: number;        // 0.0〜1.0
  tension?: "CALM" | "FOCUSED" | "ALERT" | "PANIC";
  metadata?: Record<string, any>;
}

export function createValue(
  intent: string,
  priority: number,
  metadata?: Record<string, any>
): LightValue {
  return {
    intent,
    priority,
    metadata,
    tension: "CALM",
  };
}