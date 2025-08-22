import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Playlist } from "@/models/Playlist";

export async function POST(
  req: Request,
  context: { params: Promise<{ playlistId: string }> }
) {
  try {
    await connectDB();
    const {playlistId}  = await context.params;
    const { id } = await req.json();

    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      { $addToSet: { songs: { id } } },
      { new: true }
    );

    return NextResponse.json({ playlist });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to add song" }, { status: 500 });
  }
}
