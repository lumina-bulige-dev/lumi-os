// Lumi Unified Vercel Instruction Schema
export type LumiVercelInstruction = {
  project: string                      // lumi-os / lumi-core / finance など
  environment: "production" | "staging" | "local"

  dependencies: {
    vercelAiSdk: string                // 例: "6.0.39"
    next: string                       // 例: "15.0.0"
    openaiSdk: string                  // 例: "6.17.0"
  }

  llm: {
    route: "gateway" | "litellm"       // 入口を固定
    provider: string                   // openai / anthropic / google
    model: string                      // Lumi 側で定義したモデル名
  }

  api: {
    entry: "/api/lumi"                 // Lumi 全体の統一入口
    version: "v1"
  }

  security: {
    allowEnv: string[]                 // 許可する環境変数だけ
    denyAutoUpgrade: true              // 自動更新禁止
    denyDynamicImports: true           // 動的 import 禁止
  }
}

export const SUPPORTED_MODELS = {
  openai: [
    "openai/gpt-4o",
    "openai/gpt-4o-mini",
    "openai/gpt-5",
    "openai/o1",
    "openai/o1-mini",
  ],
  anthropic: [
    "anthropic/claude-3-5-sonnet-20241022",
    "anthropic/claude-3-opus-20240229",
    "anthropic/claude-3-sonnet-20240229",
  ],
  google: [
    "google/gemini-2.0-flash-exp",
    "google/gemini-1.5-pro-latest",
    "google/gemini-1.5-flash-latest",
  ],
} as const
