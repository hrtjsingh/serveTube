import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Playlist } from "@/models/Playlist";

export async function GET(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();

    // const { userId } = await context.params;
    const userId = "68a88f642a8e27d83910bebf";
    console.log(userId, "userId from API");

    const playlist = await Playlist.find({ userId });

    return NextResponse.json({ playlist });
  } catch (err) {
    console.error("Error fetching playlists:", err);
    return NextResponse.json(
      { error: "Failed to fetch playlists" },
      { status: 500 }
    );
  }
}
