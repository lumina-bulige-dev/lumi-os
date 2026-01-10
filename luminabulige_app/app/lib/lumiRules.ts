// luminabulige_app/app/lib/lumiRules.ts
// まずは「型ガチガチにしないモック」として割り切り

export type LumiRuleLevel = "SAFE" | "WARNING" | "DANGER";

// 古いコードとの橋渡し用
export type Level = LumiRuleLevel;

export type LumiRule = {
  id: string;
  level: LumiRuleLevel;
  label: string;
  annualVolumeMax?: number;   // 年間ボリュームの目安
  singleTxMax?: number;       // 1回あたりの目安
  note?: string;
};

export type LumiRuleset = {
  id: string;
  version: string;
  rules: LumiRule[];
};

/**
 * Compare 画面用のモックルール。
 * 将来ここを「本物のルールエンジン」から差し替える。
 */
export function getDefaultRules(): LumiRuleset {
  return {
    id: "mock-default",
    version: "v1-mock",
    rules: [
      {
        id: "R1",
        level: "SAFE",
        label: "年間 48万円以下・少額決済中心",
        annualVolumeMax: 480_000,
        singleTxMax: 50_000,
        note: "生活費レベル／日常利用の想定ゾーン",
      },
      {
        id: "R2",
        level: "WARNING",
        label: "年間 48万〜300万円・副業/小規模事業",
        annualVolumeMax: 3_000_000,
        singleTxMax: 300_000,
        note: "小規模ビジネスやフリーランス規模",
      },
      {
        id: "R3",
        level: "DANGER",
        label: "年間 300万円超 or パターン異常",
        note: "ここから先は追加の説明・エビデンスが必須",
      },
    ],
  };
}

/**
 * 年間ボリュームから SAFE / WARNING / DANGER を決めるモック関数。
 * - 今は annualVolumeMax ベースだけ見ている
 * - 将来はルールエンジンで差し替え予定
 */
export function calcLevel(
  annualVolume: number,
  ruleset?: LumiRuleset
): Level {
  const rs = ruleset ?? getDefaultRules();

  // annualVolumeMax が設定されているものを小さい順に見ていく
  const sorted = [...rs.rules].sort((a, b) => {
    const ax = a.annualVolumeMax ?? Infinity;
    const bx = b.annualVolumeMax ?? Infinity;
    return ax - bx;
  });

  for (const rule of sorted) {
    const max = rule.annualVolumeMax ?? Infinity;
    if (annualVolume <= max) {
      return rule.level;
    }
  }

  // 全部すり抜けたら一番厳しい判定に倒す
  return "DANGER";
}
