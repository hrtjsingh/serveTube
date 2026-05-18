import { NextResponse } from "next/server";
import { Playlist } from "@/models/Playlist";
import { requireAuth } from "@/lib/requireAuth";
import { requirePlaylistOwner } from "@/lib/requirePlaylistOwner";
import { sanitizeString, isValidColor, LIMITS } from "@/lib/validate";

export async function PATCH(
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
    if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    // M4 + M5 FIX: sanitize all user inputs
    const update: Record<string, string> = {};
    if (body.name !== undefined) {
      const name = sanitizeString(body.name, LIMITS.NAME_MAX);
      if (name.length < 1) return NextResponse.json({ error: "Name required" }, { status: 400 });
      update.name = name;
    }
    if (body.description !== undefined) {
      update.description = sanitizeString(body.description, LIMITS.DESCRIPTION_MAX);
    }
    if (body.coverColor !== undefined) {
      if (!isValidColor(body.coverColor)) {
        return NextResponse.json({ error: "Invalid color — must be a 6-digit hex value" }, { status: 400 });
      }
      update.coverColor = body.coverColor;
    }

    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      { $set: update },
      { new: true }
    );
    return NextResponse.json({ playlist });
  } catch {
    return NextResponse.json({ error: "Failed to update playlist" }, { status: 500 });
  }
}
