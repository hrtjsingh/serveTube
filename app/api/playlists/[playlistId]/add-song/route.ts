import { NextResponse } from "next/server";
import { Playlist } from "@/models/Playlist";
import { requireAuth } from "@/lib/requireAuth";
import { requirePlaylistOwner } from "@/lib/requirePlaylistOwner";
import { isValidVideoId, LIMITS } from "@/lib/validate";

export async function POST(
  req: Request,
  context: { params: Promise<{ playlistId: string }> }
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { playlistId } = await context.params;
  const own = await requirePlaylistOwner(playlistId, auth.payload);
  if (own.error) return own.error;

  try {
    const body = await req.json().catch(() => null);

    // H2 FIX: strictly validate YouTube video ID format
    if (!body || !isValidVideoId(body.id)) {
      return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
    }

    // H4 FIX: enforce max songs per playlist
    const currentCount = (own.playlist as any).songs?.length ?? 0;
    if (currentCount >= LIMITS.SONGS_MAX) {
      return NextResponse.json(
        { error: `Maximum ${LIMITS.SONGS_MAX} songs per playlist` },
        { status: 400 }
      );
    }

    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      { $addToSet: { songs: { id: body.id } } },
      { new: true }
    );
    return NextResponse.json({ playlist });
  } catch {
    return NextResponse.json({ error: "Failed to add song" }, { status: 500 });
  }
}
