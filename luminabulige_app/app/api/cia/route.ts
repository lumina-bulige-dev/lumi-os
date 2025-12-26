// app/api/cia/route.ts
import { NextRequest } from "next/server";

const CORE_ENDPOINT = process.env.LUMI_CORE_VERIFY_URL;
// 例: https://app.luminabulige.com/api/verify みたいなURLを
// Cloudflare Pages の環境変数に設定しておく

export async function POST(req: NextRequest) {
  try {
    const { payload } = await req.json();

    if (!payload) {
      return Response.json(
        { ok: false, message: "payload が空です。" },
        { status: 400 }
      );
    }

    if (!CORE_ENDPOINT) {
      // まずはローカルダミー結果でもOK
      return Response.json({
        ok: true,
        result: "SAFE",
        message: "ダミー検証（CORE_ENDPOINT 未設定）",
      });
    }

    const coreRes = await fetch(CORE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload }),
    });

    const data = await coreRes.json();

    return Response.json(
      {
        ok: coreRes.ok,
        result: data.result ?? "UNKNOWN",
        message: data.message ?? null,
        raw: data,
      },
      { status: coreRes.status }
    );
  } catch (e) {
    console.error(e);
    return Response.json(
      { ok: false, message: "サーバ側でエラーが発生しました。" },
      { status: 500 }
    );
  }
}
