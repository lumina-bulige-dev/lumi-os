// luminabulige_app/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // トップだけ比較に強制リダイレクト
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/compare";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// "/" のみに適用（余計なパスに当てない）
export const config = {
  matcher: ["/"],
};
