import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let body: { prompt?: string } = {};
  try {
    body = (await req.json()) as { prompt?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "BAD_JSON" }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    content: "AZR chat is advisory only. A human operator records the final decision.",
    suggestions: [
      { id: "sugg_1", text: "Review the proof receipt for integrity checks." },
      { id: "sugg_2", text: "Confirm scope and rollback window before approval." },
    ],
    prompt: body.prompt ?? null,
  });
}
