export const runtime = "edge";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: cors });
}

export async function GET() {
  return Response.json(
    { ok: true, service: "cia", ts: Date.now() },
    { headers: cors }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return Response.json(
        { ok: false, error: "invalid_json" },
        { status: 400, headers: cors }
      );
    }

    // TODO: verify / proxy / 署名チェックなど
    return Response.json({ ok: true, received: body }, { headers: cors });
  } catch (e: any) {
    return Response.json(
      { ok: false, error: String(e?.message ?? e) },
      { status: 500, headers: cors }
    );
  }
}
