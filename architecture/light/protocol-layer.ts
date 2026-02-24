/**
 * Protocol Layer
 * Value を通信可能な形式に変換し、
 * 境界を越える際の安全性を保証する層
 */

import type { LightValue } from "./value-layer";

export interface LightPacket {
  header: {
    intent: string;
    priority: number;
    timestamp: number;
  };
  body: Uint8Array;
}

export function encodePacket(value: LightValue, body: Uint8Array): LightPacket {
  return {
    header: {
      intent: value.intent,
      priority: value.priority,
      timestamp: Date.now(),
    },
    body,
  };
}

export function decodePacket(packet: LightPacket): {
  intent: string;
  body: Uint8Array;
} {
  return {
    intent: packet.header.intent,
    body: packet.body,
  };
}