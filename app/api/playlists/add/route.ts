import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Playlist } from "@/models/Playlist";
import { requireAuth } from "@/lib/requireAuth";
import { sanitizeString, isValidColor, sanitizeSongs, LIMITS } from "@/lib/validate";

export async function POST(req: Request) {
  // C1 FIX: require authenticated session
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    const { songs: rawSongs, name: rawName, description: rawDesc, coverColor: rawColor } = body;

    // M5 FIX: sanitize text fields
    const name        = sanitizeString(rawName ?? "My Playlist", LIMITS.NAME_MAX);
    const description = sanitizeString(rawDesc ?? "", LIMITS.DESCRIPTION_MAX);

    // M4 FIX: validate hex color
    const coverColor = isValidColor(rawColor) ? rawColor : "#f8bf59";

    // H2 + H5 FIX: validate and sanitize songs array
    const songs = rawSongs ? sanitizeSongs(rawSongs) : [];
    if (songs === null) {
      return NextResponse.json({ error: "Invalid songs data" }, { status: 400 });
    }

    // H4 FIX: enforce playlist limit per user
    const userId      = auth.payload.id;
    const existingCount = await Playlist.countDocuments({ userId });
    if (existingCount >= LIMITS.PLAYLISTS_MAX) {
      return NextResponse.json(
        { error: `Maximum ${LIMITS.PLAYLISTS_MAX} playlists allowed` },
        { status: 400 }
      );
    }

    const playlist = await Playlist.create({
      userId,
      name: name || "My Playlist",
      description,
      coverColor,
      songs,
      isDefault: existingCount === 0,
    });

    return NextResponse.json({ success: true, playlist }, { status: 201 });
  } catch (err) {
    console.error("CREATE PLAYLIST ERROR:", err);

    return NextResponse.json(
      {
        error: "Failed to create playlist",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
