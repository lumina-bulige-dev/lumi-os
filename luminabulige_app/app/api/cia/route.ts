// app/api/verify/route.ts
export const dynamic = 'force-dynamic';
export const revalidate = 0;        // キャッシュ無効
export const runtime = 'edge';       // Cloudflare Pages 向け（任意だが推奨）

export async function GET() {
  return new Response("cia ok", {
    status: 200,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
