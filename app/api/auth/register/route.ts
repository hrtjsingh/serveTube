import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Playlist } from "@/models/Playlist";
import { createToken, hashPassword } from "@/lib/auth";
import { checkRateLimit, REGISTER_LIMIT, getClientIp } from "@/lib/rateLimit";
import { isValidEmail, isValidPassword, sanitizeString, LIMITS } from "@/lib/validate";

export async function POST(req: Request) {
  // H1 FIX: 5 registrations per hour per IP
  const ip    = getClientIp(req);
  const limit = checkRateLimit(`register:${ip}`, REGISTER_LIMIT);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many registration attempts. Try again later." },
      { status: 429 }
    );
  }

  try {
    await connectDB();
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    const { name: rawName, email: rawEmail, password } = body;

    // L4 + L3 FIX: strict server-side validation
    const name  = sanitizeString(rawName, LIMITS.NAME_MAX);
    const email = typeof rawEmail === "string" ? rawEmail.toLowerCase().trim() : "";

    if (name.length < 2)        return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
    if (!isValidEmail(email))   return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: `Password must be ${LIMITS.PASSWORD_MIN}–${LIMITS.PASSWORD_MAX} characters` },
        { status: 400 }
      );
    }

    const exists = await User.findOne({ email });
    if (exists) {
      // Small delay to prevent timing-based enumeration
      await new Promise(r => setTimeout(r, 200));
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({ name, email, passwordHash });

    // Auto-create default playlist for new user
    await Playlist.create({ userId: user._id, name: "My Playlist", isDefault: true, songs: [] });

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
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
