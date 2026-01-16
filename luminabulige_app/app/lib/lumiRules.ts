// luminabulige_app/app/lib/lumiRules.ts

/** 判定レベル */
export type LumiRuleLevel = "SAFE" | "WARNING" | "DANGER";

/** 旧API互換 */
export type Level = LumiRuleLevel;

/** 単一ルール */
export type LumiRule = {
  id: string;
  level: LumiRuleLevel;
  label: string;
  annualVolumeMax?: number;   // 年間ボリューム閾値
  singleTxMax?: number;       // 1回あたり閾値
  note?: string;
};

/** ルールセット本体 */
export type LumiRuleset = {
  id: string;
  version: string;
  createdAt?: string;         // 任意：将来の署名付レポート用
  rules: LumiRule[];
};

/** レベルごとの説明文を返す */
export const LEVEL_TEXT: Record<LumiRuleLevel, string> = {
  SAFE: "安全圏（通常の生活支出レベル）",
  WARNING: "警告圏（高ボリュームまたは頻度高め）",
  DANGER: "危険圏（異常または要説明）",
};

/** デフォルトルールセット（モック） */
export function getDefaultRules(): LumiRuleset {
  return {
    id: "mock-default",
    version: "v1-mock",
    createdAt: new Date().toISOString(),
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
 * 将来的にAI／統計ルールエンジンに差し替え可能な形に。
 */
export function calcLevel(
  annualVolume: number,
  ruleset: LumiRuleset = getDefaultRules()
): Level {
  const sorted = [...ruleset.rules].sort((a, b) =>
    (a.annualVolumeMax ?? Infinity) - (b.annualVolumeMax ?? Infinity)
  );

  for (const rule of sorted) {
    if (annualVolume <= (rule.annualVolumeMax ?? Infinity)) {
      return rule.level;
    }
  }
  return "DANGER";
}

/** 将来的に複数指標を統合した評価に拡張可能 */
export function calcRuleMatch(input: {
  annualVolume: number;
  singleTxAmount?: number;
  ruleset?: LumiRuleset;
}): { level: Level; matchedRule: LumiRule } {
  const { annualVolume, singleTxAmount, ruleset = getDefaultRules() } = input;
  const sorted = [...ruleset.rules].sort(
    (a, b) => (a.annualVolumeMax ?? Infinity) - (b.annualVolumeMax ?? Infinity)
  );

  for (const rule of sorted) {
    const volOK = annualVolume <= (rule.annualVolumeMax ?? Infinity);
    const txOK =
      singleTxAmount == null || singleTxAmount <= (rule.singleTxMax ?? Infinity);
    if (volOK && txOK) {
      return { level: rule.level, matchedRule: rule };
    }
  }
  return { level: "DANGER", matchedRule: sorted.at(-1)! };
}

