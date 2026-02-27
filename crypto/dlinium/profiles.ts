import {
  CryptoContext,
  CryptoLayer,
  CryptoStack,
  createStack,
  DummyPqcLayer,
  DummyFalconLayer,
  DummyAesLayer,
  DlininumCoreLayer,
} from "./core";

export type DliniumProfileId = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface DliniumProfile {
  id: DliniumProfileId;
  buildStack(): CryptoStack;
}

const lowProfile: DliniumProfile = {
  id: "LOW",
  buildStack() {
    return createStack([DummyAesLayer]);
  },
};

const mediumProfile: DliniumProfile = {
  id: "MEDIUM",
  buildStack() {
    return createStack([DummyPqcLayer, DummyAesLayer]);
  },
};

const highProfile: DliniumProfile = {
  id: "HIGH",
  buildStack() {
    return createStack([DummyPqcLayer, DummyFalconLayer, DlininumCoreLayer]);
  },
};

const criticalProfile: DliniumProfile = {
  id: "CRITICAL",
  buildStack() {
    return createStack([
      DummyPqcLayer,
      DummyFalconLayer,
      DlininumCoreLayer,
      DummyAesLayer,
    ]);
  },
};

export function selectProfile(ctx: CryptoContext): DliniumProfile {
  switch (ctx.riskLevel) {
    case "low": return lowProfile;
    case "medium": return mediumProfile;
    case "high": return highProfile;
    case "critical": return criticalProfile;
  }
}