import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { checkRateLimit, API_LIMIT, getClientIp } from "@/lib/rateLimit";
import { LIMITS } from "@/lib/validate";
import { extractPlaylistId } from "@/lib/youtubeUrls";

export async function POST(req: Request) {
  // H6 FIX: require authenticated user
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  // H6 FIX: rate limit imports per user (not just IP)
  const limit = checkRateLimit(`yt-import:${auth.payload.id}`, { windowMs: 60 * 60 * 1000, max: 10 });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many import requests. Try again later." }, { status: 429 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body?.url || typeof body.url !== "string") {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    const playlistId = extractPlaylistId(body.url.trim());
    if (!playlistId) {
      return NextResponse.json(
        { error: "Invalid YouTube or YouTube Music playlist URL or ID" },
        { status: 400 }
      );
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Playlist import requires a YouTube API key.", needsApiKey: true }, { status: 422 });
    }

    const songs: { id: string }[] = [];
    let pageToken: string | undefined;

    do {
      const params = new URLSearchParams({
        part: "contentDetails",
        playlistId,
        maxResults: "50",
        key: apiKey,
        ...(pageToken ? { pageToken } : {}),
      });

      const res  = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`, {
        signal: AbortSignal.timeout(10000), // 10s timeout
      });
      const data = await res.json();

      if (!res.ok) {
        // M2 FIX: don't forward raw Google error message
        return NextResponse.json({ error: "Could not fetch playlist from YouTube" }, { status: 502 });
      }

      for (const item of data.items ?? []) {
        const vid = item.contentDetails?.videoId;
        if (vid && /^[a-zA-Z0-9_-]{11}$/.test(vid)) songs.push({ id: vid });
      }

      // H4 FIX: cap at SONGS_MAX during import
      if (songs.length >= LIMITS.SONGS_MAX) {
        songs.splice(LIMITS.SONGS_MAX);
        break;
      }

      pageToken = data.nextPageToken;
    } while (pageToken);

    // Fetch playlist name only
    const metaParams = new URLSearchParams({ part: "snippet", id: playlistId, key: apiKey });
    const metaRes    = await fetch(`https://www.googleapis.com/youtube/v3/playlists?${metaParams}`, {
      signal: AbortSignal.timeout(5000),
    });
    const metaData = await metaRes.json();
    const snippet  = metaData.items?.[0]?.snippet ?? {};

    return NextResponse.json({
      songs,
      name: String(snippet.title ?? "Imported Playlist").slice(0, LIMITS.NAME_MAX),
      description: String(snippet.description ?? "").slice(0, LIMITS.DESCRIPTION_MAX),
    });
  } catch {
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
