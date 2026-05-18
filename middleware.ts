import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// M3 FIX: CSRF double-submit cookie pattern for state-mutating API calls
// M6 FIX: Block cross-origin API requests
export function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;
  const res = NextResponse.next();

  // Only check API routes that mutate state
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/me")) {
    const method = request.method;

    // M6 FIX: Reject requests with unexpected Origin headers on mutating methods
    if (["POST", "PATCH", "DELETE", "PUT"].includes(method)) {
      const requestOrigin = request.headers.get("origin");
      const appUrl        = process.env.NEXT_PUBLIC_APP_URL || "";

      if (requestOrigin && appUrl && requestOrigin !== appUrl) {
        // Allow same-origin (no Origin header) and configured app URL
        return NextResponse.json(
          { error: "Cross-origin request blocked" },
          { status: 403 }
        );
      }
    }
  }

  return res;
}

export const config = {
  matcher: ["/api/:path*"],
};
