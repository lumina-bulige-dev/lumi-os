// luminabulige_app/functions/api/cia.ts

export const onRequest = async ({ request }: { request: Request }) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  // 例：GETだけ返す（必要に応じてPOSTも）
  if (request.method === "GET") {
    return new Response(
      JSON.stringify({
        status: "ok",
        service: "cia",
        ts: new Date().toISOString(),
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...cors } }
    );
  }

  return new Response(
    JSON.stringify({ status: "ng", error: "Method Not Allowed" }),
    { status: 405, headers: { "Content-Type": "application/json", ...cors } }
  );
};
