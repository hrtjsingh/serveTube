import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Playlist } from "@/models/Playlist";

export async function DELETE(
  req: Request,
  { params }: { params: { playlistId: string } }
) {
  try {
    await connectDB();
    const { playlistId } = params;
    const { id } = await req.json();

    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      { $pull: { songs: { id } } }, 
      { new: true }
    );

    return NextResponse.json({ playlist });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete song" }, { status: 500 });
  }
}
