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

export { extractVideoId, extractPlaylistId, isYouTubeMusicUrl } from '@/lib/youtubeUrls'

type QueueItem = { id: string }

interface PlaylistSession {
  playlistId: string
  source: PlaylistSource
}

const VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/

interface PlayerCtx {
  videoId: string
  videoTitle: string
  titleLoading: boolean
  setVideoId: (id: string) => void
  queue: QueueItem[]
  syncQueueKey: (key: string) => void
  playNext: () => void
  hasStarted: boolean
  playlistsReady: boolean
  setPlaylistsReady: (ready: boolean) => void
  playerCanMount: boolean
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
  playbackStartSec: number
  clearPlaybackStart: () => void
  resumePrompt: SavedPlaylistProgress | null
  confirmResumePlayback: () => void
  startPlaylistFromBeginning: () => void
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
  const [videoId, setVideoIdState] = useState('')
  const [queueKey, setQueueKey] = useState('')
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [hasStarted, setHasStarted] = useState(false)
  const [playlistsReady, setPlaylistsReadyState] = useState(false)
  const [ytPlayer, setYtPlayer] = useState<YtPlayerApi | null>(null)
  const [homeSlotReady, setHomeSlotReady] = useState(false)
  const [videoTitle, setVideoTitle] = useState('')
  const [titleLoading, setTitleLoading] = useState(false)
  const [playlistSession, setPlaylistSessionState] = useState<PlaylistSession | null>(null)
  const [seekPosition, setSeekPosition] = useState<number | null>(null)
  const [playbackStartSec, setPlaybackStartSec] = useState(0)
  const [resumePrompt, setResumePrompt] = useState<SavedPlaylistProgress | null>(null)
  const playerSlotRef = useRef<HTMLDivElement | null>(null)
  const titleCacheRef = useRef<Record<string, string>>({})
  const resumeOfferedRef = useRef(false)
  const pendingProgressRef = useRef<SavedPlaylistProgress | null>(null)
  const prevSessionKeyRef = useRef('')

  const setPlaylistsReady = useCallback((ready: boolean) => {
    setPlaylistsReadyState(ready)
    if (!ready) resumeOfferedRef.current = false
  }, [])

  const syncQueueKey = useCallback((key: string) => {
    setQueueKey(prev => (prev === key ? prev : key))
    setQueue(prev => {
      const prevKey = prev.map(item => item.id).join(',')
      if (prevKey === key) return prev
      return key ? key.split(',').map(id => ({ id })) : []
    })
  }, [])

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
  const clearPlaybackStart = useCallback(() => setPlaybackStartSec(0), [])

  const setVideoId = useCallback(
    (id: string) => {
      if (!id || !VIDEO_ID_RE.test(id) || id === videoId) return
      setPlaybackStartSec(0)
      setSeekPosition(null)
      setVideoIdState(id)
      setHasStarted(true)
      addToHistory(id)
    },
    [addToHistory, videoId]
  )

  const startPlayback = useCallback(
    (id: string, positionSec = 0) => {
      if (!VIDEO_ID_RE.test(id)) return
      const start = Math.max(0, Math.floor(positionSec))
      setPlaybackStartSec(start)
      setSeekPosition(start > 0 ? start : null)
      setVideoIdState(id)
      setHasStarted(true)
      addToHistory(id)
    },
    [addToHistory]
  )

  const tryOfferResume = useCallback(
    (session: PlaylistSession, currentQueue: QueueItem[]) => {
      if (resumeOfferedRef.current || !currentQueue.length) return

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

      resumeOfferedRef.current = true
      setResumePrompt(saved)
    },
    []
  )

  const confirmResumePlayback = useCallback(() => {
    if (!resumePrompt) return
    const saved = resumePrompt
    setResumePrompt(null)
    startPlayback(saved.videoId, saved.positionSec)
  }, [resumePrompt, startPlayback])

  const startPlaylistFromBeginning = useCallback(() => {
    if (!queue.length) {
      setResumePrompt(null)
      return
    }

    const first = queue[0]
    setResumePrompt(null)

    if (playlistSession) {
      writePlaylistProgress({
        playlistId: playlistSession.playlistId,
        source: playlistSession.source,
        videoId: first.id,
        trackIndex: 0,
        positionSec: 0,
        updatedAt: Date.now(),
      })
    }

    startPlayback(first.id, 0)
  }, [queue, playlistSession, startPlayback])

  const setPlaylistSession = useCallback((session: PlaylistSession | null) => {
    setPlaylistSessionState(prev => {
      if (!session && !prev) return prev
      if (
        session &&
        prev &&
        (prev.playlistId !== session.playlistId || prev.source !== session.source)
      ) {
        resumeOfferedRef.current = false
      }
      if (
        session &&
        prev?.playlistId === session.playlistId &&
        prev?.source === session.source
      ) {
        return prev
      }
      return session
    })
  }, [])

  const sessionKey = playlistSession
    ? `${playlistSession.source}:${playlistSession.playlistId}`
    : ''

  useEffect(() => {
    if (sessionKey && prevSessionKeyRef.current && sessionKey !== prevSessionKeyRef.current) {
      resumeOfferedRef.current = false
      setResumePrompt(null)
    }
    prevSessionKeyRef.current = sessionKey
  }, [sessionKey])

  useEffect(() => {
    if (!playlistsReady || !playlistSession || !queueKey) return
    tryOfferResume(playlistSession, queue)
  }, [playlistsReady, playlistSession, queueKey, tryOfferResume, queue])

  const markPlayerActive = useCallback(() => setHasStarted(true), [])

  const playNext = useCallback(() => {
    if (!queue.length) return
    const idx = queue.findIndex(v => v.id === videoId)
    const next = queue[idx < queue.length - 1 ? idx + 1 : 0]
    setVideoId(next.id)
  }, [queue, videoId, setVideoId])

  const persistProgress = useCallback(() => {
    if (!playlistSession || !queue.length || !hasStarted || !videoId) return

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
    (id: string) => {
      resumeOfferedRef.current = true
      setResumePrompt(null)
      setPlaylistsReady(true)
      startPlayback(id)
    },
    [setPlaylistsReady, startPlayback]
  )

  const trackIndex = useMemo(
    () => queue.findIndex(item => item.id === videoId),
    [queue, videoId]
  )
  const trackNumber = trackIndex >= 0 ? trackIndex + 1 : null
  const trackTotal = queue.length
  const playerCanMount = playlistsReady && VIDEO_ID_RE.test(videoId)

  useEffect(() => {
    if (!videoId) {
      setVideoTitle('')
      setTitleLoading(false)
      return
    }

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

  return (
    <PlayerContext.Provider
      value={{
        videoId,
        videoTitle,
        titleLoading,
        setVideoId,
        queue,
        syncQueueKey,
        playNext,
        hasStarted,
        playlistsReady,
        setPlaylistsReady,
        playerCanMount,
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
        playbackStartSec,
        clearPlaybackStart,
        resumePrompt,
        confirmResumePlayback,
        startPlaylistFromBeginning,
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
