export const runtime = "edge";


const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: cors });
}

export async function GET() {
  return Response.json(
    { status: "ok", service: "cia-api", ts: Date.now() },
    { headers: cors }
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 例：lumi-core-api に中継する（EdgeでOKなやつ）
    // const r = await fetch("https://app.luminabulige.com/cia", { ... })

    return Response.json({ ok: true, received: body }, { headers: cors });
  } catch (e: any) {
    return Response.json(
      { ok: false, error: e?.message ?? "unknown" },
      { status: 400, headers: cors }
    );
  }
}
