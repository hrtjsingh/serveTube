'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useSearchParams } from 'next/navigation'

const LS_HIST = 'servetube_watch_history'
const DEFAULT_VIDEO = '36AKk9A5gH8'

const lsGet = (k: string, fallback: unknown = null) => {
  try {
    return JSON.parse(localStorage.getItem(k) as string) ?? fallback
  } catch {
    return fallback
  }
}
const lsSet = (k: string, v: unknown) => {
  try {
    localStorage.setItem(k, JSON.stringify(v))
  } catch {}
}

export function extractVideoId(link: string): string {
  const re =
    /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ \r\n]{11})/
  const m = link.match(re)
  return m ? m[1] : link.length === 11 ? link : ''
}

type QueueItem = { id: string }

interface PlayerCtx {
  videoId: string
  setVideoId: (id: string) => void
  queue: QueueItem[]
  setQueue: (q: QueueItem[]) => void
  playNext: () => void
  hasStarted: boolean
  markPlayerActive: () => void
  playerSlotRef: React.RefObject<HTMLDivElement | null>
  setPlayerSlotEl: (node: HTMLDivElement | null) => void
  homeSlotReady: boolean
  ytPlayer: unknown | null
  setYtPlayer: (p: unknown | null) => void
}

const PlayerContext = createContext<PlayerCtx>({} as PlayerCtx)

function PlayerSearchParamsSync({ onVideoFromUrl }: { onVideoFromUrl: (id: string) => void }) {
  const searchParams = useSearchParams()
  useEffect(() => {
    const v = searchParams.get('v')
    if (v && v.length === 11) onVideoFromUrl(v)
  }, [searchParams, onVideoFromUrl])
  return null
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [videoId, setVideoIdState] = useState(DEFAULT_VIDEO)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [hasStarted, setHasStarted] = useState(false)
  const [ytPlayer, setYtPlayer] = useState<unknown | null>(null)
  const [homeSlotReady, setHomeSlotReady] = useState(false)
  const playerSlotRef = useRef<HTMLDivElement | null>(null)

  const setPlayerSlotEl = useCallback((node: HTMLDivElement | null) => {
    playerSlotRef.current = node
    setHomeSlotReady(!!node)
  }, [])

  const addToHistory = useCallback((id: string) => {
    const hist = (lsGet(LS_HIST, []) as { id: string; watchedAt: number }[]) || []
    const updated = [{ id, watchedAt: Date.now() }, ...hist.filter(x => x.id !== id)].slice(0, 50)
    lsSet(LS_HIST, updated)
  }, [])

  const setVideoId = useCallback(
    (id: string) => {
      if (!id || id === videoId) return
      setVideoIdState(id)
      setHasStarted(true)
      addToHistory(id)
    },
    [addToHistory, videoId]
  )

  const markPlayerActive = useCallback(() => setHasStarted(true), [])

  const playNext = useCallback(() => {
    if (!queue.length) return
    const idx = queue.findIndex(v => v.id === videoId)
    const next = queue[idx < queue.length - 1 ? idx + 1 : 0]
    setVideoId(next.id)
  }, [queue, videoId, setVideoId])

  const handleVideoFromUrl = useCallback(
    (id: string) => setVideoId(id),
    [setVideoId]
  )

  return (
    <PlayerContext.Provider
      value={{
        videoId,
        setVideoId,
        queue,
        setQueue,
        playNext,
        hasStarted,
        markPlayerActive,
        playerSlotRef,
        setPlayerSlotEl,
        homeSlotReady,
        ytPlayer,
        setYtPlayer,
      }}
    >
      <React.Suspense fallback={null}>
        <PlayerSearchParamsSync onVideoFromUrl={handleVideoFromUrl} />
      </React.Suspense>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  return useContext(PlayerContext)
}
