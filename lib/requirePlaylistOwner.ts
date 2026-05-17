import { NextResponse } from "next/server";
import { Playlist } from "@/models/Playlist";
import { connectDB } from "./mongodb";
import { isValidObjectId } from "./validate";
import type { AuthPayload } from "./requireAuth";

/**
 * C1 FIX: Verifies that the authenticated user actually owns the playlist.
 * Prevents IDOR — user A cannot modify user B's playlist.
 */
export async function requirePlaylistOwner(
  playlistId: string,
  auth: AuthPayload
): Promise<
  | { playlist: any; error?: never }
  | { error: NextResponse; playlist?: never }
> {
  if (!isValidObjectId(playlistId)) {
    return { error: NextResponse.json({ error: "Invalid playlist ID" }, { status: 400 }) };
  }

  await connectDB();
  const playlist = await Playlist.findById(playlistId).lean();

  if (!playlist) {
    return { error: NextResponse.json({ error: "Playlist not found" }, { status: 404 }) };
  }

  // Ownership check — userId stored as ObjectId, compare as string
  if (playlist.userId.toString() !== auth.id) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { playlist };
}
