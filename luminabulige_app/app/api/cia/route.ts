export const runtime = "edge";

export async function GET() {
  return new Response("cia ok", {
    status: 200,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
