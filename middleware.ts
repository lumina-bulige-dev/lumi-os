import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const url = req.nextUrl;

  // adminサブドメインなら /admin 配下へ寄せる
  if (host.startsWith("admin.")) {
    if (!url.pathname.startsWith("/admin")) {
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
