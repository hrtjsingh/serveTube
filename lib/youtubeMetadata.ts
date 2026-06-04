export async function fetchYouTubeTitle(videoId: string): Promise<string> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    )
    if (!res.ok) throw new Error('Failed to fetch title')
    const data = await res.json()
    return typeof data.title === 'string' && data.title ? data.title : videoId
  } catch {
    return videoId
  }
}
