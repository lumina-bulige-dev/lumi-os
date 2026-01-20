import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.json({ ok: false, error: "MISSING_TOKEN" }, { status: 400 });
  }

  const { env } = getRequestContext();
  const kv = env.LUMI_PROOFS as KVNamespace | undefined;
  if (!kv) {
    return NextResponse.json({ ok: false, error: "KV_BINDING_MISSING" }, { status: 500 });
  }

  const receipt = await kv.get(token);
  return NextResponse.json({ ok: true, token, receipt });
}
