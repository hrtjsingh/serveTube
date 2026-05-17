import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("st_token")?.value;
    if (!token) return NextResponse.json({ user: null }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ user: null }, { status: 401 });
    await connectDB();
    const user = await User.findById(payload.id).select("-passwordHash");
    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
