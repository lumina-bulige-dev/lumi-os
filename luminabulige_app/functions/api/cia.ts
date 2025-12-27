export const onRequestGet = async () => Response.json({ ok: true });
export const onRequestPost = async ({ request }: any) => {
  const body = await request.json().catch(() => null);
  return Response.json({ ok: true, received: body });
};
