import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { createToken, verifyPassword } from "@/lib/auth";
import { checkRateLimit, AUTH_LIMIT, getClientIp } from "@/lib/rateLimit";
import { isValidEmail } from "@/lib/validate";

export async function POST(req: Request) {
  // H1 FIX: rate limit by IP — 10 attempts per 15 min, then 15 min lockout
  const ip    = getClientIp(req);
  const limit = checkRateLimit(`login:${ip}`, AUTH_LIMIT);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Too many login attempts. Try again in ${Math.ceil(limit.retryAfterMs / 60000)} minutes.` },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } }
    );
  }

  try {
    await connectDB();
    const body = await req.json().catch(() => null);

    // L4 FIX: validate email format server-side
    if (!body || !isValidEmail(body.email) || typeof body.password !== "string") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { email, password } = body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always run bcrypt even on unknown email to prevent timing-based user enumeration
    const dummyHash = "$2b$12$invalidhashfortimingprotectiononly000000000000000000";
    const hashToCheck = user?.passwordHash ?? dummyHash;
    const valid = await verifyPassword(password, hashToCheck);

    if (!user || !valid) {
      // M2 FIX: generic error, no user enumeration
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await createToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    const res = NextResponse.json({
      user: { id: user._id, name: user.name, email: user.email },
    });
    res.cookies.set("st_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",   // M3 FIX: strict instead of lax
      maxAge: 60 * 60 * 24 * 7, // 7 days (reduced from 30)
      path: "/",
    });
    return res;
  } catch {
    // M2 FIX: never leak internal error details
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
