import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { requireAuth } from "@/lib/requireAuth";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const user = await User.findById(auth.payload.id).select("-passwordHash").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
