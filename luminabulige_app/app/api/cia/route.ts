export const runtime = "edge";

export async function GET(req: Request) {
  return new Response("cia ok", {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "x-cia-handler": "app/api/cia/route.ts",
    },
  });
}
