import type { CSSProperties } from 'react'
import type { YtPlayerApi } from '@/lib/playlistProgress'

/** In-viewport invisible player — off-screen iframes are often paused by Chrome. */
export const BACKGROUND_PLAYER_STYLE: CSSProperties = {
  position: 'fixed',
  bottom: '0',
  right: '0',
  width: '320px',
  height: '180px',
  opacity: '0',
  overflow: 'hidden',
  pointerEvents: 'none',
  zIndex: '-1',
}

/** @deprecated Use BACKGROUND_PLAYER_STYLE */
export const HIDDEN_PLAYER_STYLE = BACKGROUND_PLAYER_STYLE

const YT_PLAYING = 1
const YT_BUFFERING = 3

type MediaHandlers = {
  onPlay: () => void
  onPause: () => void
  onNext: () => void
}

export function syncMediaSession(
  videoId: string,
  title: string,
  handlers: MediaHandlers
): void {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return

  const artwork = videoId
    ? [
        {
          src: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          sizes: '480x360',
          type: 'image/jpeg',
        },
      ]
    : []

  navigator.mediaSession.metadata = new MediaMetadata({
    title: title || 'ServeTube',
    artist: 'ServeTube',
    album: 'Your playlist',
    artwork,
  })

  try {
    navigator.mediaSession.setActionHandler('play', handlers.onPlay)
    navigator.mediaSession.setActionHandler('pause', handlers.onPause)
    navigator.mediaSession.setActionHandler('nexttrack', handlers.onNext)
    navigator.mediaSession.setActionHandler('previoustrack', null)
  } catch {
    // Some handlers unsupported on this device
  }
}

export function clearMediaSession(): void {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return
  navigator.mediaSession.metadata = null
  try {
    navigator.mediaSession.setActionHandler('play', null)
    navigator.mediaSession.setActionHandler('pause', null)
    navigator.mediaSession.setActionHandler('nexttrack', null)
  } catch {
    // ignore
  }
}

function tryResume(player: YtPlayerApi, userPaused: boolean): void {
  if (userPaused || !document.hidden) return
  try {
    const state = player.getPlayerState?.()
    if (state === YT_PLAYING || state === YT_BUFFERING) return
    player.playVideo?.()
  } catch {
    // iframe not ready
  }
}

export function attachBackgroundKeepalive(
  getPlayer: () => YtPlayerApi | null,
  isUserPaused: () => boolean
): () => void {
  const onVisibility = () => {
    const player = getPlayer()
    if (!player || !document.hidden) return
    tryResume(player, isUserPaused())
  }

  const onPageShow = () => {
    const player = getPlayer()
    if (!player) return
    tryResume(player, isUserPaused())
  }

  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('pageshow', onPageShow)

  const interval = window.setInterval(() => {
    const player = getPlayer()
    if (!player || !document.hidden) return
    tryResume(player, isUserPaused())
  }, 1500)

  return () => {
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('pageshow', onPageShow)
    window.clearInterval(interval)
  }
}
