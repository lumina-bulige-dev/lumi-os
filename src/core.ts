// src/core.ts
export const AION = new Proxy({}, {
  get() {
    throw new Error("AION is not available in public context.");
  }
});
