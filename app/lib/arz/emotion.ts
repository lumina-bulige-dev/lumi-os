export const EMOTION_TAGS = ["安心", "焦り", "後悔", "誘惑", "決意", "無感情"] as const;
export type EmotionTag = (typeof EMOTION_TAGS)[number];

export const STATE_TAGS = ["S1", "S2", "S3"] as const;
export type StateTag = (typeof STATE_TAGS)[number];

export const STATE_LABELS: Record<StateTag, string> = {
  S1: "安定",
  S2: "揺れ",
  S3: "危険",
};

export const ACTION_TAGS = ["記録", "保留", "確認", "一時停止"] as const;
export type ActionTag = (typeof ACTION_TAGS)[number];

export const SITUATION_TAGS = ["単発", "連続", "増加", "減少", "未確定"] as const;
export type SituationTag = (typeof SITUATION_TAGS)[number];

export const FORBIDDEN_WORDS = [
  "おすすめ",
  "推奨",
  "助言",
  "べき",
  "必ず",
  "絶対",
  "良い",
  "悪い",
  "正しい",
  "間違い",
  "確定",
  "保証",
];

export type SpeechTemplateType = "fact" | "state" | "procedure" | "boundary";
export const SPEECH_TEMPLATES: Record<SpeechTemplateType, string[]> = {
  fact: ["記録しました。", "入力を受け取りました。"],
  state: ["この状態が積み上がっています。", "状態タグは維持されています。"],
  procedure: ["必要なら手順を整理できます。", "ログの追加はいつでも可能です。"],
  boundary: ["判断は行いません。", "評価・助言・断定はしません。"],
};

export type ExpressionLabel = {
  state: StateTag;
  emotion: EmotionTag;
  action: ActionTag;
  label: string;
};

export const EXPRESSION_LABELS: ExpressionLabel[] = STATE_TAGS.flatMap((state) =>
  EMOTION_TAGS.flatMap((emotion) =>
    ACTION_TAGS.map((action) => ({
      state,
      emotion,
      action,
      label: `${state}/${emotion}/${action}`,
    }))
  )
);

export function composeDerivedLabel(input: {
  emotion: EmotionTag;
  action: ActionTag;
  situation: SituationTag;
}): string | null {
  const label = `${input.emotion}/${input.action}/${input.situation}`;
  if (FORBIDDEN_WORDS.some((word) => label.includes(word))) {
    return null;
  }
  return label;
}

export const PROOF_ROLE = "改ざん検知の唯一の真実";
export const NFT_ROLE = "Proofへのポインタ（価値主張なし）";
export const ARZ_ROLE = "判断しない同席者（注釈のみ）";

export function createInitialImprint(input: { state: StateTag; comment: string }) {
  return {
    state: input.state,
    comment: input.comment,
    ui: "static",
    consent: "one-click",
    revocable: false,
  } as const;
}
