export const onRequestGet: PagesFunction = async () => {
  return Response.json({ ok: true, service: "cia-api", ts: Date.now() });
};

export const onRequestPost: PagesFunction = async ({ request }) => {
  const body = await request.json().catch(() => null);
  return Response.json({ ok: true, received: body, ts: Date.now() });
};
