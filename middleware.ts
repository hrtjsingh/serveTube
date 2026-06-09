import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// M3/M6: Block cross-origin mutating API requests (SameSite cookies + Origin/Referer check)
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const method = request.method;
  if (!["POST", "PATCH", "DELETE", "PUT"].includes(method)) {
    return NextResponse.next();
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  if (!appUrl) {
    return NextResponse.next();
  }

  const requestOrigin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (requestOrigin && requestOrigin !== appUrl) {
    return NextResponse.json({ error: "Cross-origin request blocked" }, { status: 403 });
  }

  if (process.env.NODE_ENV === "production" && !requestOrigin && referer && !referer.startsWith(appUrl)) {
    return NextResponse.json({ error: "Cross-origin request blocked" }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
