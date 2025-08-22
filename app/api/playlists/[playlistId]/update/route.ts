import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Playlist } from "@/models/Playlist";

export async function POST(
  req: Request,
  context: { params: Promise<{ playlistId: string }> }
) {
  try {
    await connectDB();
    const { playlistId } = await context.params;
    const body = await req.json();
    const { songs } = body;

     let playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $set: { songs } },
        { new: true }
      );

    return NextResponse.json({ playlist });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update playlist" }, { status: 500 });
  }
}
