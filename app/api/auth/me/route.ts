import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("st_token")?.value;
    if (!token) return NextResponse.json({ user: null }, { status: 401 });

    // C5 FIX: properly await verifyToken
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ user: null }, { status: 401 });

    return NextResponse.json({ user: payload });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}

export async function DELETE() {
  // M3 FIX: add SameSite=Strict on logout clear
  const res = NextResponse.json({ ok: true });
  res.cookies.set("st_token", "", {
    maxAge: 0, path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  return res;
}
