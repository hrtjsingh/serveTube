import { NextResponse } from "next/server";
import { Playlist } from "@/models/Playlist";
import { requireAuth } from "@/lib/requireAuth";
import { requirePlaylistOwner } from "@/lib/requirePlaylistOwner";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ playlistId: string }> }
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { playlistId } = await context.params;
  const own = await requirePlaylistOwner(playlistId, auth.payload);
  if (own.error) return own.error;

  try {
    await Playlist.findByIdAndDelete(playlistId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete playlist" }, { status: 500 });
  }
}
