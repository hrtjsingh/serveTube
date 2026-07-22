'use client'

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import YouTube from 'react-youtube'
import { usePathname, useRouter } from 'next/navigation'
import { usePlayer } from '@/context/PlayerContext'
import { Maximize2, Minimize2, SkipForward } from 'lucide-react'
import {
  enterPlayerFullscreen,
  exitPlayerFullscreen,
  isFullscreenActive,
  lockLandscape,
  unlockLandscape,
} from '@/lib/mobileFullscreen'
import type { YtPlayerApi } from '@/lib/playlistProgress'
import {
  attachBackgroundKeepalive,
  BACKGROUND_PLAYER_STYLE,
  clearMediaSession,
  HIDDEN_PLAYER_STYLE,
  syncMediaSession,
  YT_BUFFERING,
  YT_CUED,
  YT_ENDED,
  YT_PAUSED,
  YT_PLAYING,
} from '@/lib/backgroundPlayback'

const PSEUDO_FULLSCREEN_STYLE: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  maxWidth: '100vw',
  maxHeight: '100vh',
  opacity: 1,
  overflow: 'hidden',
  pointerEvents: 'auto',
  zIndex: 500,
  background: '#000',
}

export function GlobalPlayer() {
  const pathname = usePathname()
  const router = useRouter()
  const {
    videoId,
    videoTitle,
    titleLoading,
    playNext,
    getNextVideoId,
    hasStarted,
    playerSlotRef,
    homeSlotReady,
    ytPlayer,
    setYtPlayer,
    markPlayerActive,
    seekPosition,
    clearSeekPosition,
    playbackStartSec,
    persistProgress,
    trackNumber,
    trackTotal,
    playerCanMount,
  } = usePlayer()

  const playerContainerRef = useRef<HTMLDivElement>(null)
  const ytReadyRef = useRef(false)
  const pendingSeekRef = useRef<number | null>(null)
  const userPausedRef = useRef(false)
  const endHandledRef = useRef(false)
  const ytPlayerRef = useRef<YtPlayerApi | null>(null)
  const [playerMounted, setPlayerMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false)
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false)

  const isFullscreen = isNativeFullscreen || isPseudoFullscreen

  useEffect(() => {
    setPlayerMounted(true)
    const mq = window.matchMedia('(max-width: 1023px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const isHome = pathname === '/'
  const showMini = hasStarted && !isHome && !isFullscreen
  const showOnHome = isHome && homeSlotReady

  const syncPlayerPosition = useCallback(() => {
    const el = playerContainerRef.current
    const slot = playerSlotRef.current
    if (!el) return

    if (isFullscreen) {
      if (isPseudoFullscreen) {
        Object.assign(el.style, PSEUDO_FULLSCREEN_STYLE as Record<string, string>)
      }
      return
    }

    if (isHome && homeSlotReady && slot) {
      const rect = slot.getBoundingClientRect()
      Object.assign(el.style, {
        position: 'fixed',
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        opacity: '1',
        overflow: 'hidden',
        pointerEvents: 'auto',
        zIndex: '20',
      })
    } else {
      Object.assign(el.style, BACKGROUND_PLAYER_STYLE as Record<string, string>)
    }
  }, [isHome, homeSlotReady, playerSlotRef, isFullscreen, isPseudoFullscreen])

  useLayoutEffect(() => {
    syncPlayerPosition()
  }, [syncPlayerPosition])

  useEffect(() => {
    if (!showOnHome || isFullscreen) return

    const slot = playerSlotRef.current
    window.addEventListener('scroll', syncPlayerPosition, true)
    window.addEventListener('resize', syncPlayerPosition)

    const ro = slot ? new ResizeObserver(syncPlayerPosition) : null
    if (slot && ro) ro.observe(slot)

    return () => {
      window.removeEventListener('scroll', syncPlayerPosition, true)
      window.removeEventListener('resize', syncPlayerPosition)
      ro?.disconnect()
    }
  }, [showOnHome, syncPlayerPosition, playerSlotRef, isFullscreen])

  useEffect(() => {
    document.body.classList.toggle('has-mini-player', showMini)
    document.body.classList.toggle('player-fullscreen-active', isFullscreen)
    return () => {
      document.body.classList.remove('has-mini-player')
      document.body.classList.remove('player-fullscreen-active')
    }
  }, [showMini, isFullscreen])

  useEffect(() => {
    const onFullscreenChange = () => {
      const active = isFullscreenActive(playerContainerRef.current)
      setIsNativeFullscreen(active)
      if (!active) {
        unlockLandscape()
        setIsPseudoFullscreen(false)
      }
    }

    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  const enterFullscreen = useCallback(async () => {
    const el = playerContainerRef.current
    if (!el) return

    try {
      await enterPlayerFullscreen(el)
      setIsNativeFullscreen(true)
    } catch {
      setIsPseudoFullscreen(true)
      await lockLandscape()
    }
  }, [])

  const exitFullscreen = useCallback(async () => {
    setIsPseudoFullscreen(false)
    await exitPlayerFullscreen()
    setIsNativeFullscreen(false)
    unlockLandscape()
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      void exitFullscreen()
    } else {
      void enterFullscreen()
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen])

  const shouldRenderPlayer = playerMounted && playerCanMount

  const safeSeekTo = useCallback((player: YtPlayerApi, seconds: number) => {
    if (!player) return false
    try {
      player.seekTo(seconds, true)
      return true
    } catch {
      return false
    }
  }, [])

  const applyPendingSeek = useCallback(
    (player: YtPlayerApi): boolean => {
      const pos = pendingSeekRef.current
      if (pos == null || pos < 1 || !player) return false
      if (safeSeekTo(player, pos)) {
        pendingSeekRef.current = null
        return true
      }
      return false
    },
    [safeSeekTo]
  )

  useEffect(() => {
    if (!shouldRenderPlayer) {
      setYtPlayer(null)
      ytReadyRef.current = false
    }
  }, [shouldRenderPlayer, setYtPlayer])

  useEffect(() => {
    if (seekPosition == null) return
    pendingSeekRef.current = seekPosition
    clearSeekPosition()
  }, [seekPosition, clearSeekPosition])

  useEffect(() => {
    if (!ytPlayer || pendingSeekRef.current == null) return

    let cancelled = false
    let attempts = 0

    const trySeek = () => {
      if (cancelled || pendingSeekRef.current == null || attempts > 40) return
      attempts += 1
      if (!applyPendingSeek(ytPlayer)) {
        window.setTimeout(trySeek, 250)
      }
    }

    trySeek()
    return () => {
      cancelled = true
    }
  }, [ytPlayer, videoId, applyPendingSeek])

  useEffect(() => {
    ytPlayerRef.current = ytPlayer
  }, [ytPlayer])

  useEffect(() => {
    endHandledRef.current = false
  }, [videoId])

  const handleVideoEnd = useCallback(() => {
    if (endHandledRef.current) return
    if (!getNextVideoId()) return

    endHandledRef.current = true
    userPausedRef.current = false
    persistProgress()
    playNext()
  }, [getNextVideoId, persistProgress, playNext])

  const ensurePlaying = useCallback((player: YtPlayerApi) => {
    if (userPausedRef.current) return
    try {
      const state = player.getPlayerState?.()
      if (state === YT_PLAYING || state === YT_BUFFERING) return
      player.playVideo?.()
    } catch {
      // iframe not ready
    }
  }, [])

  useEffect(() => {
    if (!ytPlayer || !videoId) return

    let cancelled = false
    let attempts = 0

    const tryAutoplay = () => {
      if (cancelled || attempts >= 30 || userPausedRef.current) return
      attempts += 1
      ensurePlaying(ytPlayer)
      const state = ytPlayer.getPlayerState?.()
      if (state === YT_PLAYING || state === YT_BUFFERING) return
      window.setTimeout(tryAutoplay, 400)
    }

    tryAutoplay()
    return () => {
      cancelled = true
    }
  }, [videoId, ytPlayer, ensurePlaying])

  useEffect(() => {
    if (!hasStarted || !ytPlayer) return

    const interval = window.setInterval(() => {
      if (userPausedRef.current || endHandledRef.current) return
      try {
        const state = ytPlayer.getPlayerState?.()
        if (state === YT_ENDED) handleVideoEnd()
      } catch {
        // player not ready
      }
    }, 1000)

    return () => window.clearInterval(interval)
  }, [hasStarted, ytPlayer, handleVideoEnd])

  useEffect(() => {
    if (!hasStarted || !videoId) {
      clearMediaSession()
      return
    }

    syncMediaSession(videoId, videoTitle, {
      onPlay: () => {
        userPausedRef.current = false
        ytPlayerRef.current?.playVideo?.()
      },
      onPause: () => {
        userPausedRef.current = true
        ytPlayerRef.current?.pauseVideo?.()
      },
      onNext: () => playNext(),
    })

    return () => clearMediaSession()
  }, [hasStarted, videoId, videoTitle, playNext])

  useEffect(() => {
    if (!hasStarted) return
    return attachBackgroundKeepalive(
      () => ytPlayerRef.current,
      () => userPausedRef.current,
      handleVideoEnd
    )
  }, [hasStarted, handleVideoEnd])

  useEffect(() => {
    if (!hasStarted) return

    const tick = () => persistProgress()
    const interval = window.setInterval(tick, 5000)
    const onUnload = () => tick()
    window.addEventListener('beforeunload', onUnload)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('beforeunload', onUnload)
      tick()
    }
  }, [hasStarted, persistProgress, videoId])

  const showFullscreenControl =
    isMobile && playerCanMount && (showOnHome || isFullscreen)

  return (
    <>
      <div
        ref={playerContainerRef}
        className="servetube-player-shell bg-black"
        style={HIDDEN_PLAYER_STYLE}
        aria-hidden={!showOnHome && !isFullscreen}
      >
        {shouldRenderPlayer ? (
          <YouTube
            key={videoId}
            className="w-full h-full"
            videoId={videoId}
            opts={{
              width: '100%',
              height: '100%',
              playerVars: {
                autoplay: 1,
                rel: 0,
                modestbranding: 1,
                playsinline: 1,
                controls: 1,
                fs: isMobile ? 0 : 1,
                ...(playbackStartSec > 0 ? { start: playbackStartSec } : {}),
              },
            }}
            onReady={e => {
              setYtPlayer(e.target)
              applyPendingSeek(e.target)
              ensurePlaying(e.target)
              if (!ytReadyRef.current) {
                ytReadyRef.current = true
                markPlayerActive()
              }
            }}
            onStateChange={e => {
              const state = e.data
              if (state === 1 || state === 3) userPausedRef.current = false
              if (state === YT_PAUSED) userPausedRef.current = true
              if (state === YT_ENDED) handleVideoEnd()
              if (state === YT_CUED && !userPausedRef.current) ensurePlaying(e.target)

              if (pendingSeekRef.current == null) return
              if (state === 1 || state === 2 || state === 3 || state === 5) {
                applyPendingSeek(e.target)
              }
            }}
            onEnd={handleVideoEnd}
          />
        ) : null}

        {showFullscreenControl && (
          <button
            type="button"
            onClick={toggleFullscreen}
            className="absolute bottom-3 right-3 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm border border-white/20 hover:bg-black/90 transition-colors"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        )}
      </div>

      {showMini && (
        <div
          className="fixed left-0 right-0 z-[45] border-t border-border/60 bg-card/95 shadow-lg shadow-black/10 backdrop-blur-xl bottom-16 lg:bottom-0"
          role="region"
          aria-label="Now playing"
        >
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-2.5">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="relative aspect-video w-16 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/50"
            >
              <img
                src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`}
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-brand/10" />
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="min-w-0 flex-1 text-left"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-brand">
                {trackNumber && trackTotal > 1
                  ? `Track ${trackNumber} of ${trackTotal}`
                  : 'Now playing'}
              </p>
              <p className="truncate text-sm font-medium">
                {titleLoading ? 'Loading…' : videoTitle}
              </p>
            </button>
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={playNext}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Next video"
              >
                <SkipForward size={18} />
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="rounded-lg p-2 text-brand transition-colors hover:bg-brand/10"
                aria-label="Open full player"
              >
                <Maximize2 size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
