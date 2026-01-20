import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const url = req.nextUrl;
  const isAdminHost =
    host.startsWith("admin.") || host.startsWith("azr.") || host.includes("localhost") || host.includes("127.0.0.1");

  if (url.pathname.startsWith("/azr") && !isAdminHost) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  if (url.pathname.startsWith("/azr")) {
    res.headers.set("x-azr-guard", "human-only");
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
