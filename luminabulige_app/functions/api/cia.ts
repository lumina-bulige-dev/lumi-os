// functions/api/cia.ts
export async function onRequestPost({ request }: { request: Request }) {
  try {
    const body = await request.json();

    return new Response(
      JSON.stringify({ ok: true, received: body }),
      {
        headers: {
          "content-type": "application/json; charset=utf-8",
          "access-control-allow-origin": "*",
        },
      }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ ok: false, error: "invalid_json" }),
      {
        status: 400,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "access-control-allow-origin": "*",
        },
      }
    );
  }
}

// （念のため）OPTIONSも返すとCORSで詰みにくい
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
    },
  });
}
