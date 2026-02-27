import { __LumiCore } from "./internal/__lumi-core";

// 観測者の状態（仮）
const observer = {
  position: "Okayama",
  intent: "Preserve Sovereignty",
  psychologicalState: "Focused",
  narrativeContext: "LumiOS Genesis",
};

// デモ暗号化
const packet = __LumiCore.QUQTEXFOLCON.encryptWithQuantumKey("Hello, Lumi‑OS!", observer);

// 出力確認
console.log("🔐 Encrypted Packet:", packet);
