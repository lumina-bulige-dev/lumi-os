import { NextResponse } from "next/server";

import {
  ACTION_TAGS,
  ARZ_ROLE,
  EMOTION_TAGS,
  EXPRESSION_LABELS,
  NFT_ROLE,
  PROOF_ROLE,
  SPEECH_TEMPLATES,
  STATE_LABELS,
  STATE_TAGS,
  SITUATION_TAGS,
  composeDerivedLabel,
  createInitialImprint,
} from "@/app/lib/arz/emotion";

export async function POST(req: Request) {
  let body: { prompt?: string } = {};
  try {
    body = (await req.json()) as { prompt?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "BAD_JSON" }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    content: SPEECH_TEMPLATES.state[0],
    notes: {
      role: ARZ_ROLE,
      proof: PROOF_ROLE,
      nft: NFT_ROLE,
    },
    dictionary: {
      emotions: EMOTION_TAGS,
      states: STATE_TAGS.map((tag) => ({ tag, label: STATE_LABELS[tag] })),
      actions: ACTION_TAGS,
      situations: SITUATION_TAGS,
    },
    speechTemplates: SPEECH_TEMPLATES,
    expressionLabels: EXPRESSION_LABELS,
    derivedLabelExample: composeDerivedLabel({
      emotion: EMOTION_TAGS[0],
      action: ACTION_TAGS[0],
      situation: SITUATION_TAGS[0],
    }),
    initialImprint: createInitialImprint({
      state: "S1",
      comment: "状態を記録しました。",
    }),
    suggestions: [
      { id: "sugg_1", text: "どの状態タグに近いですか？" },
      { id: "sugg_2", text: "今の感情タグはどれに該当しますか？" },
    ],
    prompt: body.prompt ?? null,
  });
}
