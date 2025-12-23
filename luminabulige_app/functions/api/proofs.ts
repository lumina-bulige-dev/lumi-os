// functions/api/proofs.ts

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...cors,
      ...(init.headers ?? {}),
    },
  });
}

export const onRequestOptions = async () => {
  return new Response(null, { status: 204, headers: cors });
};

export const onRequestGet = async ({ request }: { request: Request }) => {
  const { searchParams } = new URL(request.url);
  const proofId = searchParams.get("proofId");
  return json({ ok: true, proofId });
};

export const onRequestPost = async ({ request }: { request: Request }) => {
  const body = await request.json().catch(() => null);
  return json({ ok: true, body });
};
