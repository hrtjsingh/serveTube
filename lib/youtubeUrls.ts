const VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/

/** YouTube + YouTube Music watch URLs and bare 11-char IDs */
export function extractVideoId(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''
  if (VIDEO_ID_RE.test(trimmed)) return trimmed

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  try {
    const url = new URL(withProtocol)
    const host = url.hostname.replace(/^www\./, '').toLowerCase()

    if (
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'music.youtube.com' ||
      host === 'www.youtube.com'
    ) {
      const v = url.searchParams.get('v')
      if (v && VIDEO_ID_RE.test(v)) return v

      const pathMatch = url.pathname.match(/\/(?:embed|v|shorts)\/([a-zA-Z0-9_-]{11})/)
      if (pathMatch?.[1]) return pathMatch[1]
    }

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0]
      if (id && VIDEO_ID_RE.test(id)) return id
    }
  } catch {
    // fall through to regex
  }

  const re =
    /(?:music\.youtube\.com\/watch\?(?:[^#\s]*&)?v=|music\.youtube\.com\/watch\?v=|(?:www\.)?(?:m\.)?youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  const m = trimmed.match(re)
  return m?.[1] ?? ''
}

/** Playlist list= param from YouTube or YouTube Music (PL…, OLAK5uy_…, RDCLAK…, etc.) */
export function extractPlaylistId(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  if (/^[A-Za-z][A-Za-z0-9_-]{9,}$/.test(trimmed)) return trimmed

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  try {
    const url = new URL(withProtocol)
    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    if (
      host !== 'youtube.com' &&
      host !== 'm.youtube.com' &&
      host !== 'music.youtube.com'
    ) {
      return null
    }
    const list = url.searchParams.get('list')
    if (list && /^[A-Za-z][A-Za-z0-9_-]{9,}$/.test(list)) return list
  } catch {
    return null
  }

  return null
}

export function isYouTubeMusicUrl(input: string): boolean {
  try {
    const url = new URL(/^https?:\/\//i.test(input.trim()) ? input.trim() : `https://${input.trim()}`)
    return url.hostname.replace(/^www\./, '').toLowerCase() === 'music.youtube.com'
  } catch {
    return /music\.youtube\.com/i.test(input)
  }
}
