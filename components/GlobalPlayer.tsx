'use client'

import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import YouTube from 'react-youtube'
import { usePathname, useRouter } from 'next/navigation'
import { usePlayer } from '@/context/PlayerContext'
import { Maximize2, SkipForward } from 'lucide-react'

const HIDDEN_PLAYER_STYLE: React.CSSProperties = {
  position: 'fixed',
  top: -9999,
  left: -9999,
  width: 1,
  height: 1,
  opacity: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
  zIndex: -1,
}

export function GlobalPlayer() {
  const pathname = usePathname()
  const router = useRouter()
  const {
    videoId,
    playNext,
    hasStarted,
    playerSlotRef,
    homeSlotReady,
    setYtPlayer,
    markPlayerActive,
  } = usePlayer()

  const playerContainerRef = useRef<HTMLDivElement>(null)
  const ytReadyRef = useRef(false)

  const isHome = pathname === '/'
  const showMini = hasStarted && !isHome
  const showOnHome = isHome && homeSlotReady

  const syncPlayerPosition = useCallback(() => {
    const el = playerContainerRef.current
    const slot = playerSlotRef.current
    if (!el) return

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
      Object.assign(el.style, HIDDEN_PLAYER_STYLE as Record<string, string>)
    }
  }, [isHome, homeSlotReady, playerSlotRef])

  useLayoutEffect(() => {
    syncPlayerPosition()
  }, [syncPlayerPosition])

  useEffect(() => {
    if (!showOnHome) return

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
  }, [showOnHome, syncPlayerPosition, playerSlotRef])

  useEffect(() => {
    document.body.classList.toggle('has-mini-player', showMini)
    return () => document.body.classList.remove('has-mini-player')
  }, [showMini])

  return (
    <>
      <div
        ref={playerContainerRef}
        className="bg-black"
        style={HIDDEN_PLAYER_STYLE}
        aria-hidden={!showOnHome}
      >
        <YouTube
          className="w-full h-full"
          videoId={videoId}
          opts={{
            width: '100%',
            height: '100%',
            playerVars: { autoplay: 1, rel: 0, modestbranding: 1, playsinline: 1, controls: 1 },
          }}
          onReady={e => {
            setYtPlayer(e.target)
            if (!ytReadyRef.current) {
              ytReadyRef.current = true
              markPlayerActive()
            }
          }}
          onEnd={playNext}
        />
      </div>

      {showMini && (
        <div
          className="fixed left-0 right-0 z-[45] border-t border-border bg-card/95 backdrop-blur-md shadow-lg bottom-16 sm:bottom-0"
          role="region"
          aria-label="Now playing"
        >
          <div className="flex items-center gap-3 px-3 py-2 max-w-7xl mx-auto">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="relative flex-shrink-0 w-14 aspect-video rounded-md overflow-hidden bg-muted"
            >
              <img
                src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex-1 min-w-0 text-left"
            >
              <p className="text-xs text-muted-foreground">Now playing</p>
              <p className="text-sm font-mono font-medium truncate">{videoId}</p>
            </button>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={playNext}
                className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Next video"
              >
                <SkipForward size={18} />
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="rounded-md p-2 text-[#f8bf59] hover:bg-[#f8bf59]/10 transition-colors"
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
