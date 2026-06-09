const VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/

export async function fetchYouTubeTitle(videoId: string): Promise<string> {
  if (!VIDEO_ID_RE.test(videoId)) return videoId

  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`,
      { signal: AbortSignal.timeout(8000) }
    )
    if (!res.ok) throw new Error('Failed to fetch title')
    const data = await res.json()
    return typeof data.title === 'string' && data.title ? data.title : videoId
  } catch {
    return videoId
  }
}
