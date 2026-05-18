import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "./auth";

export interface AuthPayload {
  id: string;
  email: string;
  name: string;
}

/**
 * Verifies the st_token cookie on every protected route.
 * Returns { payload } on success, or { error: NextResponse } to return immediately.
 */
export async function requireAuth(): Promise<
  | { payload: AuthPayload; error?: never }
  | { error: NextResponse; payload?: never }
> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("st_token")?.value;
    if (!token) {
      return {
        error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      };
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return {
        error: NextResponse.json({ error: "Invalid or expired session" }, { status: 401 }),
      };
    }
    return { payload };
  } catch {
    return {
      error: NextResponse.json({ error: "Authentication error" }, { status: 401 }),
    };
  }
}
