import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Playlist } from "@/models/Playlist";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { userId, songs } = body;

    if (!userId || !songs) {
      return NextResponse.json(
        { error: "userId and songs are required" },
        { status: 400 }
      );
    }

    let playlist = await Playlist.findOne({ userId });

    if (playlist) {
      return NextResponse.json(
        { success: true, playlist, message: "Playlist already exists" },
        { status: 200 }
      );
    }
    playlist = await Playlist.create({ userId, songs });

    return NextResponse.json(
      { success: true, playlist, message: "New playlist created" },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error creating playlist:", err);
    return NextResponse.json(
      { error: "Failed to create playlist" },
      { status: 500 }
    );
  }
}
