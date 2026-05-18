import { NextResponse } from "next/server";
import { Playlist } from "@/models/Playlist";
import { requireAuth } from "@/lib/requireAuth";
import { requirePlaylistOwner } from "@/lib/requirePlaylistOwner";
import { isValidVideoId } from "@/lib/validate";

export async function DELETE(
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

    // H2 FIX: validate video ID
    if (!body || !isValidVideoId(body.id)) {
      return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
    }

    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      { $pull: { songs: { id: body.id } } },
      { new: true }
    );
    return NextResponse.json({ playlist });
  } catch {
    return NextResponse.json({ error: "Failed to remove song" }, { status: 500 });
  }
}
