'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useSearchParams } from 'next/navigation'
import { fetchYouTubeTitle } from '@/lib/youtubeMetadata'
import { readLocalJson, writeLocalJson } from '@/lib/storage'
import {
  type PlaylistSource,
  type SavedPlaylistProgress,
  type YtPlayerApi,
  readPlaylistProgress,
  writePlaylistProgress,
} from '@/lib/playlistProgress'

const LS_HIST = 'servetube_watch_history'
const DEFAULT_VIDEO = '36AKk9A5gH8'

export { extractVideoId, extractPlaylistId, isYouTubeMusicUrl } from '@/lib/youtubeUrls'

type QueueItem = { id: string }

export interface PlaylistSession {
  playlistId: string
  source: PlaylistSource
}

interface PlayerCtx {
  videoId: string
  videoTitle: string
  titleLoading: boolean
  setVideoId: (id: string) => void
  queue: QueueItem[]
  setQueue: (q: QueueItem[]) => void
  playNext: () => void
  hasStarted: boolean
  markPlayerActive: () => void
  playerSlotRef: React.RefObject<HTMLDivElement | null>
  setPlayerSlotEl: (node: HTMLDivElement | null) => void
  homeSlotReady: boolean
  ytPlayer: YtPlayerApi | null
  setYtPlayer: (p: YtPlayerApi | null) => void
  playlistSession: PlaylistSession | null
  setPlaylistSession: (session: PlaylistSession | null) => void
  trackNumber: number | null
  trackTotal: number
  seekPosition: number | null
  clearSeekPosition: () => void
  persistProgress: () => void
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
  const [ytPlayer, setYtPlayer] = useState<YtPlayerApi | null>(null)
  const [homeSlotReady, setHomeSlotReady] = useState(false)
  const [videoTitle, setVideoTitle] = useState('')
  const [titleLoading, setTitleLoading] = useState(true)
  const [playlistSession, setPlaylistSessionState] = useState<PlaylistSession | null>(null)
  const [seekPosition, setSeekPosition] = useState<number | null>(null)
  const playerSlotRef = useRef<HTMLDivElement | null>(null)
  const titleCacheRef = useRef<Record<string, string>>({})
  const restoredRef = useRef(false)
  const pendingProgressRef = useRef<SavedPlaylistProgress | null>(null)

  const setPlayerSlotEl = useCallback((node: HTMLDivElement | null) => {
    playerSlotRef.current = node
    setHomeSlotReady(!!node)
  }, [])

  useEffect(() => {
    pendingProgressRef.current = readPlaylistProgress()
  }, [])

  const addToHistory = useCallback((id: string) => {
    const hist = readLocalJson<{ id: string; watchedAt: number }[]>(LS_HIST, [])
    const updated = [{ id, watchedAt: Date.now() }, ...hist.filter(x => x.id !== id)].slice(0, 50)
    writeLocalJson(LS_HIST, updated)
  }, [])

  const clearSeekPosition = useCallback(() => setSeekPosition(null), [])

  const setVideoId = useCallback(
    (id: string) => {
      if (!id || id === videoId) return
      setVideoIdState(id)
      setHasStarted(true)
      addToHistory(id)
    },
    [addToHistory, videoId]
  )

  const tryRestoreProgress = useCallback(
    (session: PlaylistSession, currentQueue: QueueItem[]) => {
      if (restoredRef.current || !currentQueue.length) return

      const saved = pendingProgressRef.current
      if (
        !saved ||
        saved.playlistId !== session.playlistId ||
        saved.source !== session.source
      ) {
        return
      }

      const trackIndex = currentQueue.findIndex(item => item.id === saved.videoId)
      if (trackIndex < 0) return

      restoredRef.current = true
      pendingProgressRef.current = null

      if (saved.positionSec > 1) {
        setSeekPosition(saved.positionSec)
      }

      if (saved.videoId !== videoId) {
        setVideoIdState(saved.videoId)
        setHasStarted(true)
        addToHistory(saved.videoId)
      }
    },
    [addToHistory, videoId]
  )

  const setPlaylistSession = useCallback(
    (session: PlaylistSession | null) => {
      setPlaylistSessionState(session)
      if (session) {
        tryRestoreProgress(session, queue)
      }
    },
    [queue, tryRestoreProgress]
  )

  useEffect(() => {
    if (playlistSession && queue.length) {
      tryRestoreProgress(playlistSession, queue)
    }
  }, [playlistSession, queue, tryRestoreProgress])

  const markPlayerActive = useCallback(() => setHasStarted(true), [])

  const playNext = useCallback(() => {
    if (!queue.length) return
    const idx = queue.findIndex(v => v.id === videoId)
    const next = queue[idx < queue.length - 1 ? idx + 1 : 0]
    setVideoId(next.id)
  }, [queue, videoId, setVideoId])

  const persistProgress = useCallback(() => {
    if (!playlistSession || !queue.length || !hasStarted) return

    const trackIndex = queue.findIndex(item => item.id === videoId)
    if (trackIndex < 0) return

    const positionSec = Math.floor(ytPlayer?.getCurrentTime?.() ?? 0)

    writePlaylistProgress({
      playlistId: playlistSession.playlistId,
      source: playlistSession.source,
      videoId,
      trackIndex,
      positionSec,
      updatedAt: Date.now(),
    })
  }, [playlistSession, queue, hasStarted, videoId, ytPlayer])

  const handleVideoFromUrl = useCallback(
    (id: string) => setVideoId(id),
    [setVideoId]
  )

  const trackIndex = useMemo(
    () => queue.findIndex(item => item.id === videoId),
    [queue, videoId]
  )
  const trackNumber = trackIndex >= 0 ? trackIndex + 1 : null
  const trackTotal = queue.length

  useEffect(() => {
    const cached = titleCacheRef.current[videoId]
    if (cached) {
      setVideoTitle(cached)
      setTitleLoading(false)
      return
    }

    let cancelled = false
    setTitleLoading(true)
    setVideoTitle('')

    fetchYouTubeTitle(videoId).then(title => {
      if (cancelled) return
      titleCacheRef.current[videoId] = title
      setVideoTitle(title)
      setTitleLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [videoId])

  useEffect(() => {
    if (!hasStarted) return
    persistProgress()
  }, [videoId, hasStarted, persistProgress])

  return (
    <PlayerContext.Provider
      value={{
        videoId,
        videoTitle,
        titleLoading,
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
        playlistSession,
        setPlaylistSession,
        trackNumber,
        trackTotal,
        seekPosition,
        clearSeekPosition,
        persistProgress,
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
