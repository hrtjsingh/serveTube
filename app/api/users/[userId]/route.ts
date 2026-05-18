import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Playlist } from "@/models/Playlist";
import { requireAuth } from "@/lib/requireAuth";
import { isValidObjectId } from "@/lib/validate";

export async function GET(
  _req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  // C2 FIX: require auth
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { userId } = await context.params;

  // H3 FIX: validate ObjectId format to prevent NoSQL injection
  if (!isValidObjectId(userId)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  // C2 FIX: users can only fetch their OWN playlists
  if (auth.payload.id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();
    const playlist = await Playlist.find({ userId }).lean();
    return NextResponse.json({ playlist });
  } catch {
    return NextResponse.json({ error: "Failed to fetch playlists" }, { status: 500 });
  }
}
