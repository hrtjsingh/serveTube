'use client'
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import List from './List'
import { useAuth } from '@/context/AuthContext'
import { usePlayer, extractVideoId, isYouTubeMusicUrl } from '@/context/PlayerContext'
import { PlaylistManager, PlaylistDoc } from './PlaylistManager'
import axios from 'axios'
import AuthModal from './AuthModal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { PromptDialog } from '@/components/PromptDialog'
import { GuestBanner } from '@/components/ui/guest-banner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Play, Plus, ListVideo, SkipForward, Trash2,
  CloudUpload, CheckCircle2,
  Loader2, WifiOff, Clock, ArrowUpDown
} from 'lucide-react'
import { readLocalJson, writeLocalJson } from '@/lib/storage'
import {
  DEFAULT_LOCAL_PLAYLIST,
  LS_PLAYLIST_LEGACY,
  LS_PLAYLISTS,
  loadLocalPlaylistsFromStorage,
  type LocalPlaylist,
} from '@/lib/localPlaylists'
import { readPlaylistProgress } from '@/lib/playlistProgress'
import { cn } from '@/lib/utils'

const LS_HIST = 'servetube_watch_history'

/** Persists across home mount/unmount so auth playlists are not re-fetched every navigation. */
let authPlaylistsLoaded = false

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 5)  return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}

const EMPTY_SONGS: { id: string }[] = []

export default function VideoPlayer() {
  const { user, isSignedIn, isLoaded } = useAuth()
  const {
    videoId,
    videoTitle,
    titleLoading,
    setVideoId,
    syncQueueKey,
    setPlayerSlotEl,
    setPlaylistSession,
    setPlaylistsReady,
    playlistsReady,
    playerCanMount,
    resumePrompt,
    trackNumber,
    trackTotal,
  } = usePlayer()

  const [videoURL, setVideoURL] = useState('')
  const [showAuth, setShowAuth] = useState(false)
  const [toast, setToast]       = useState<{ msg: string; type?: string } | null>(null)
  const playerRef = useRef<HTMLDivElement>(null)

  // ── Auth user playlist state ─────────────────────────────────────────────
  const [dbPlaylists, setDbPlaylists]       = useState<PlaylistDoc[]>([])
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null)
  const [isSyncing, setIsSyncing]           = useState(false)
  const [isDirty, setIsDirty]               = useState(false)
  const [lastSynced, setLastSynced]         = useState<number | null>(null)
  const [syncError, setSyncError]           = useState<string | null>(null)

  // ── Guest local playlist state (defaults until client hydration) ─────────
  const [localPlaylists, setLocalPlaylists] = useState<LocalPlaylist[]>([DEFAULT_LOCAL_PLAYLIST])
  const [activeLocalId, setActiveLocalId]   = useState<string>(DEFAULT_LOCAL_PLAYLIST._id)
  const [history, setHistory]               = useState<{ id: string; watchedAt: number }[]>([])
  const [storageReady, setStorageReady]     = useState(false)
  const [authPlaylistsLoading, setAuthPlaylistsLoading] = useState(false)
  const [showNewPlaylistPrompt, setShowNewPlaylistPrompt] = useState(false)
  const [mobileTab, setMobileTab]                   = useState<'watch' | 'queue'>('watch')
  const [deleteLocalTarget, setDeleteLocalTarget] = useState<LocalPlaylist | null>(null)
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false)

  const hydrateGuestPlaylists = useCallback(() => {
    const { playlists, activeId } = loadLocalPlaylistsFromStorage()
    setLocalPlaylists(playlists)
    setActiveLocalId(activeId)
    return { playlists, activeId }
  }, [])

  useEffect(() => {
    hydrateGuestPlaylists()
    setHistory(readLocalJson(LS_HIST, []))
    setStorageReady(true)
  }, [hydrateGuestPlaylists])

  useEffect(() => {
    if (!isLoaded || isSignedIn || !storageReady) return
    setPlaylistsReady(true)
  }, [isLoaded, isSignedIn, storageReady, setPlaylistsReady])

  // ── Active song list (derived) ───────────────────────────────────────────
  const activeList = useMemo(() => {
    if (isSignedIn) {
      return dbPlaylists.find(p => p._id === activePlaylistId)?.songs ?? EMPTY_SONGS
    }
    return localPlaylists.find(p => p._id === activeLocalId)?.songs ?? EMPTY_SONGS
  }, [isSignedIn, dbPlaylists, activePlaylistId, localPlaylists, activeLocalId])

  const queueKey = useMemo(() => activeList.map(v => v.id).join(','), [activeList])
  const activePlaylistKey = isSignedIn ? activePlaylistId : activeLocalId
  const lastPlayerSyncRef = useRef('')

  useEffect(() => {
    const playlistSource = isSignedIn ? 'auth' : 'local'
    const syncToken = `${activePlaylistKey ?? ''}:${playlistSource}:${queueKey}`
    if (lastPlayerSyncRef.current === syncToken) return
    lastPlayerSyncRef.current = syncToken

    syncQueueKey(queueKey)

    if (!activePlaylistKey || !queueKey) {
      setPlaylistSession(null)
      return
    }

    setPlaylistSession({
      playlistId: activePlaylistKey,
      source: playlistSource,
    })
  }, [activePlaylistKey, queueKey, isSignedIn, syncQueueKey, setPlaylistSession])

  const setActiveList = (songs: { id: string }[]) => {
    if (isSignedIn) {
      setDbPlaylists(ps => ps.map(p => p._id === activePlaylistId ? { ...p, songs } : p))
      if (authPlaylistsLoaded) { setIsDirty(true); setSyncError(null) }
    } else {
      setLocalPlaylists(ps => {
        const updated = ps.map(p => p._id === activeLocalId ? { ...p, songs } : p)
        writeLocalJson(LS_PLAYLISTS, updated)
        return updated
      })
    }
  }

  // Persist history
  useEffect(() => {
    if (!storageReady) return
    writeLocalJson(LS_HIST, history)
  }, [history, storageReady])

  // On auth change
  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      hydrateGuestPlaylists()
      authPlaylistsLoaded = false
      if (storageReady) setPlaylistsReady(true)
      return
    }
    if (!authPlaylistsLoaded) {
      setPlaylistsReady(false)
      loadUserPlaylists()
    }
  }, [isLoaded, isSignedIn, storageReady, setPlaylistsReady, hydrateGuestPlaylists])

  const showToast = useCallback((msg: string, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const refreshHistory = () => setHistory(readLocalJson(LS_HIST, []))

  useEffect(() => {
    refreshHistory()
  }, [videoId])

  // ── Load user playlists from DB ──────────────────────────────────────────
  const loadUserPlaylists = async () => {
    setAuthPlaylistsLoading(true)
    try {
      const me = await axios.get('/api/users/save')
      if (!me.data.user) return
      const uid = me.data.user._id
      const res = await axios.get(`/api/users/${uid}`)
      const ps: PlaylistDoc[] = res.data.playlist || []

      const localList = readLocalJson<{ id: string }[]>(LS_PLAYLIST_LEGACY, [])

      if (ps.length === 0) {
        // Create default playlist, optionally seeding from local storage
        const seeds = localList.length ? localList : [{ id: '36AKk9A5gH8' }]
        const cr = await axios.post('/api/playlists/add', {
          userId: uid, songs: seeds, name: 'My Playlist', isDefault: true
        })
        const created = cr.data.playlist
        authPlaylistsLoaded = true
        setDbPlaylists([created])
        setActivePlaylistId(created._id)
        setLastSynced(Date.now()); setIsDirty(false)
        if (localList.length) writeLocalJson(LS_PLAYLIST_LEGACY, [])
      } else {
        // Merge local list into first playlist
        const first = ps[0]
        let merged  = [...first.songs]
        for (const item of localList) {
          if (!merged.find((x: any) => x.id === item.id)) merged.push(item)
        }
        if (localList.length) {
          await axios.post(`/api/playlists/${first._id}/update`, { songs: merged })
          ps[0] = { ...first, songs: merged }
          writeLocalJson(LS_PLAYLIST_LEGACY, [])
        }
        authPlaylistsLoaded = true
        const progress = readPlaylistProgress()
        let activeId = ps[0]._id
        if (progress?.source === 'auth') {
          const match = ps.find(p => p._id === progress.playlistId)
          if (match) activeId = match._id
        }
        setDbPlaylists(ps)
        setActivePlaylistId(activeId)
        setLastSynced(Date.now()); setIsDirty(false)
      }
    } catch { showToast('Could not load playlists', 'error') }
    finally {
      setAuthPlaylistsLoading(false)
      setPlaylistsReady(true)
    }
  }

  // ── Sync to DB ───────────────────────────────────────────────────────────
  const syncToDatabase = useCallback(async () => {
    if (!isSignedIn || !activePlaylistId || isSyncing) return
    setIsSyncing(true); setSyncError(null)
    try {
      const songs = dbPlaylists.find(p => p._id === activePlaylistId)?.songs || []
      await axios.post(`/api/playlists/${activePlaylistId}/update`, { songs })
      setIsDirty(false); setLastSynced(Date.now())
      showToast('Playlist synced ✓', 'success')
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'Sync failed'
      setSyncError(msg); showToast(msg, 'error')
    } finally { setIsSyncing(false) }
  }, [isSignedIn, activePlaylistId, isSyncing, dbPlaylists, showToast])

  // ── Add / remove songs ───────────────────────────────────────────────────
  const addToList = () => {
    if (activeList.find((v: any) => v.id === videoId)) { showToast('Already in playlist', 'info'); return }
    const updated = [...activeList, { id: videoId }]
    setActiveList(updated)
    if (isSignedIn && activePlaylistId) {
      axios.post(`/api/playlists/${activePlaylistId}/add-song`, { id: videoId })
        .then(r => {
          setDbPlaylists(ps => ps.map(p => p._id === activePlaylistId ? r.data.playlist : p))
          setIsDirty(false); setLastSynced(Date.now())
        })
        .catch(() => setIsDirty(true))
    }
    showToast('Added to playlist ✓', 'success')
  }

  const deleteFromList = (id: string) => {
    setActiveList(activeList.filter((v: any) => v.id !== id))
    if (isSignedIn && activePlaylistId) {
      axios.delete(`/api/playlists/${activePlaylistId}/delete-song`, { data: { id } })
        .then(r => {
          setDbPlaylists(ps => ps.map(p => p._id === activePlaylistId ? r.data.playlist : p))
          setIsDirty(false); setLastSynced(Date.now())
        })
        .catch(() => setIsDirty(true))
    }
  }

  const updateList = async (list: { id: string }[]) => {
    setActiveList(list)
    if (isSignedIn && activePlaylistId) {
      try {
        await axios.post(`/api/playlists/${activePlaylistId}/update`, { songs: list })
        setIsDirty(false); setLastSynced(Date.now())
      } catch { setIsDirty(true) }
    }
  }

  const reverseQueue = () => {
    if (activeList.length < 2) return
    const reversed = [...activeList].reverse()
    void updateList(reversed)
    showToast('Queue reversed', 'success')
  }

  const clearPlaylist = async () => {
    setActiveList([])
    if (isSignedIn && activePlaylistId) {
      try {
        await axios.post(`/api/playlists/${activePlaylistId}/update`, { songs: [] })
        setIsDirty(false); setLastSynced(Date.now())
      } catch { setIsDirty(true) }
    }
    showToast('Playlist cleared', 'info')
  }

  // ── Video controls ────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const id = extractVideoId(videoURL.trim())
    if (!id) {
      showToast(
        isYouTubeMusicUrl(videoURL.trim())
          ? 'Use a YouTube Music song link (watch?v=…), not album/artist browse pages'
          : 'Invalid YouTube / YouTube Music URL or video ID',
        'error'
      )
      return
    }
    setVideoId(id); setVideoURL('')
  }

  const changeVideo = (id: string) => setVideoId(id)

  const playNext = () => {
    if (!activeList.length) return
    const idx  = activeList.findIndex((v: any) => v.id === videoId)
    const next = activeList[idx < activeList.length - 1 ? idx + 1 : 0]
    changeVideo(next.id)
  }

  const alreadyInList = activeList.some((v: any) => v.id === videoId)

  const isPlayerLoading =
    !isLoaded ||
    !storageReady ||
    (isSignedIn ? authPlaylistsLoading : !playlistsReady) ||
    (playlistsReady &&
      !resumePrompt &&
      activeList.length > 0 &&
      !playerCanMount)

  // ── Playlist manager callbacks ────────────────────────────────────────────
  const handlePlaylistCreated = (p: PlaylistDoc) => {
    setDbPlaylists(ps => [...ps, p])
    setActivePlaylistId(p._id)
  }
  const handlePlaylistUpdated = (p: PlaylistDoc) =>
    setDbPlaylists(ps => ps.map(x => x._id === p._id ? p : x))
  const handlePlaylistDeleted = (id: string) => {
    setDbPlaylists(ps => {
      const remaining = ps.filter(x => x._id !== id)
      if (activePlaylistId === id) setActivePlaylistId(remaining[0]?._id || null)
      return remaining
    })
  }

  // ── Local playlist management ─────────────────────────────────────────────
  const createLocalPlaylist = (name: string) => {
    const newP: LocalPlaylist = {
      _id: `local-${Date.now()}`, name, description: '', coverColor: '#f8bf59', songs: [], isDefault: false
    }
    const updated = [...localPlaylists, newP]
    setLocalPlaylists(updated); writeLocalJson(LS_PLAYLISTS, updated)
    setActiveLocalId(newP._id)
    showToast(`Playlist "${name}" created ✓`, 'success')
  }
  const deleteLocalPlaylist = (id: string) => {
    const remaining = localPlaylists.filter(p => p._id !== id)
    if (!remaining.length) {
      const def = { ...DEFAULT_LOCAL_PLAYLIST }
      setLocalPlaylists([def]); writeLocalJson(LS_PLAYLISTS, [def]); setActiveLocalId(def._id)
    } else {
      setLocalPlaylists(remaining); writeLocalJson(LS_PLAYLISTS, remaining)
      if (activeLocalId === id) setActiveLocalId(remaining[0]._id)
    }
    showToast('Playlist deleted', 'info')
  }

  // Sync panel style helpers
  const syncLabel = isSyncing ? 'Syncing…' : isDirty ? 'Sync to Database' : 'Synced'
  const syncClass = isSyncing
    ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300 cursor-not-allowed'
    : syncError
    ? 'bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30'
    : isDirty
    ? 'bg-brand border-brand text-brand-foreground hover:bg-brand-hover shadow-md'
    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'

  return (
    <div className="w-full space-y-4">

      {/* ── URL bar ── */}
      <form onSubmit={handleSubmit}
        className="st-card flex flex-col items-center gap-3 p-3 sm:flex-row sm:p-4">
        <div className="relative w-full flex-1">
          <Input type="text" placeholder="Paste YouTube or YouTube Music link / video ID…" value={videoURL}
            onChange={e => setVideoURL(e.target.value)} />
        </div>
        <Button type="submit" variant="brand" disabled={!videoURL.trim()} className="w-full whitespace-nowrap sm:w-auto">
          <Play size={14} /> Play Video
        </Button>
      </form>

      {/* ── Mobile tabs ── */}
      <div className="st-mobile-tabs" role="tablist" aria-label="Player sections">
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === 'watch'}
          onClick={() => setMobileTab('watch')}
          className={cn('st-mobile-tab', mobileTab === 'watch' ? 'st-mobile-tab-active' : 'st-mobile-tab-inactive')}
        >
          <Play size={14} /> Now Playing
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === 'queue'}
          onClick={() => setMobileTab('queue')}
          className={cn('st-mobile-tab', mobileTab === 'queue' ? 'st-mobile-tab-active' : 'st-mobile-tab-inactive')}
        >
          <ListVideo size={14} /> Queue
          {activeList.length > 0 && (
            <span className="st-badge-brand ml-0.5">{activeList.length}</span>
          )}
        </button>
      </div>

      {/* ── Player + Sidebar ── */}
      <div className="video-player-layout flex flex-col gap-4 lg:flex-row">

        {/* Player column */}
        <div className={cn('min-w-0 flex-1 space-y-4', mobileTab !== 'watch' && 'hidden lg:block')}>
          <div className="st-card-elevated overflow-hidden">
            <div
              ref={playerRef}
              className="relative h-[min(56vh,420px)] min-h-[280px] w-full overflow-hidden sm:aspect-video sm:h-auto sm:min-h-0"
            >
              <div className="st-player-glow" />
              <div ref={setPlayerSlotEl} className="relative h-full w-full bg-black">
                {isPlayerLoading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/80 text-muted-foreground">
                    <Loader2 size={28} className="animate-spin text-brand" />
                    <span className="text-sm">Loading playlist…</span>
                  </div>
                )}
                {playlistsReady && !resumePrompt && activeList.length === 0 && !playerCanMount && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-6 text-center">
                    <div className="rounded-2xl bg-muted/30 p-4">
                      <ListVideo size={32} className="text-muted-foreground/40" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Nothing playing yet</p>
                    <p className="max-w-xs text-xs text-muted-foreground">Paste a link above or pick a video from your playlist</p>
                  </div>
                )}
              </div>
            </div>
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-t border-border">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug line-clamp-2">
                  {titleLoading ? (
                    <span className="text-muted-foreground text-xs">Loading title…</span>
                  ) : (
                    videoTitle
                  )}
                </p>
                {trackNumber && trackTotal > 1 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Track {trackNumber} of {trackTotal}
                  </p>
                )}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={playNext} disabled={activeList.length < 2}>
                  <SkipForward size={13} /> Next
                </Button>
                <Button variant="success" size="sm" onClick={alreadyInList ? undefined : addToList} disabled={alreadyInList}>
                  <Plus size={13} /> {alreadyInList ? 'In Playlist' : 'Add to Playlist'}
                </Button>
              </div>
            </div>
          </div>

          {/* Guest banner */}
          {!isSignedIn && isLoaded && (
            <GuestBanner
              message="Playlist saved locally."
              actionLabel="Sync to cloud"
              onAction={() => setShowAuth(true)}
            />
          )}

          {/* Watch History (guests) */}
          {/* {!isSignedIn && history.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Recent</h3>
                <button onClick={() => setShowClearHistoryConfirm(true)}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors">Clear</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {history.slice(0, 8).map(h => (
                  <button key={h.id + h.watchedAt} onClick={() => changeVideo(h.id)}
                    className="font-mono text-xs bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-md transition-colors">
                    {h.id}
                  </button>
                ))}
              </div>
            </div>
          )} */}
        </div>

        {/* ── Sidebar ── */}
        <div className={cn('st-sidebar-panel', mobileTab !== 'queue' && 'hidden lg:flex')}>

            {/* ── Playlist Manager (auth users) ── */}
            {isSignedIn && user && (
              <div className="st-card p-4">
                <PlaylistManager
                  userId={(user as any).id || (user as any)._id}
                  playlists={dbPlaylists}
                  activeId={activePlaylistId}
                  onSelect={id => { setActivePlaylistId(id); setIsDirty(false) }}
                  onCreated={handlePlaylistCreated}
                  onUpdated={handlePlaylistUpdated}
                  onDeleted={handlePlaylistDeleted}
                  showToast={showToast}
                />
              </div>
            )}

            {/* ── Guest playlist switcher ── */}
            {!isSignedIn && (
              <div className="st-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold flex items-center gap-1.5">
                    <ListVideo size={14} className="text-brand" /> Playlists
                    <span className="rounded-full bg-brand/20 text-brand text-xs font-bold px-2 py-0.5">{localPlaylists.length}</span>
                  </span>
                  <button
                    onClick={() => setShowNewPlaylistPrompt(true)}
                    className="flex items-center gap-1 rounded-md bg-brand px-2 py-1.5 text-xs font-bold text-brand-foreground hover:bg-brand-hover transition-colors">
                    <Plus size={12} /> New
                  </button>
                </div>
                <div className="space-y-1">
                  {localPlaylists.map(p => (
                    <div key={p._id}
                      onClick={() => setActiveLocalId(p._id)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-all ${
                        p._id === activeLocalId ? 'border-brand/40 bg-brand/10' : 'border-border hover:bg-muted/30'
                      }`}>
                      <div className="h-6 w-6 rounded-md flex items-center justify-center" style={{ background: p.coverColor }}>
                        <ListVideo size={11} className="text-white" />
                      </div>
                      <span className="flex-1 text-sm font-medium truncate">{p.name}</span>
                      <span className="text-xs text-muted-foreground">{p.songs.length}</span>
                      {localPlaylists.length > 1 && (
                        <button onClick={e => { e.stopPropagation(); setDeleteLocalTarget(p) }}
                          className="text-muted-foreground hover:text-red-400 transition-colors p-1">
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Sync panel (auth users) ── */}
            {isSignedIn && (
              <div className={`rounded-xl border p-3 transition-all ${
                syncError ? 'border-red-500/30 bg-red-500/5' :
                isDirty   ? 'border-yellow-500/40 bg-yellow-500/5' :
                            'border-emerald-500/20 bg-emerald-500/5'
              }`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {syncError ? <WifiOff size={14} className="text-red-400 flex-shrink-0" />
                      : isDirty ? <CloudUpload size={14} className="text-yellow-400 flex-shrink-0" />
                      : <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />}
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold ${syncError ? 'text-red-400' : isDirty ? 'text-yellow-300' : 'text-emerald-400'}`}>
                        {syncError ? 'Sync failed' : isDirty ? 'Unsaved changes' : 'Up to date'}
                      </p>
                      {storageReady && lastSynced && !isDirty && !syncError && (
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5" suppressHydrationWarning>
                          <Clock size={10} /> {timeAgo(lastSynced)}
                        </p>
                      )}
                    </div>
                  </div>
                  <button onClick={syncToDatabase} disabled={isSyncing || (!isDirty && !syncError)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition-all flex-shrink-0 disabled:cursor-not-allowed ${syncClass}`}>
                    {isSyncing ? <><Loader2 size={13} className="animate-spin" /> Syncing…</>
                      : syncError ? <><CloudUpload size={13} /> Retry</>
                      : isDirty  ? <><CloudUpload size={13} /> Sync Now</>
                      :            <><CheckCircle2 size={13} /> Synced</>}
                  </button>
                </div>
                {isSyncing && <div className="mt-2 h-0.5 rounded-full bg-border overflow-hidden"><div className="h-full bg-yellow-400 animate-pulse w-full" /></div>}
              </div>
            )}

            {/* ── Song queue for active playlist ── */}
            {activeList.length > 0 && (
              <div className="st-card overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <ListVideo size={15} className="text-brand" />
                    <span className="text-sm font-bold">Queue</span>
                    <span className="rounded-full bg-brand/20 text-brand text-xs font-bold px-2 py-0.5">{activeList.length}</span>
                  </div>
                  <button
                    type="button"
                    onClick={reverseQueue}
                    disabled={activeList.length < 2}
                    title="Reverse queue order"
                    aria-label="Reverse queue order"
                    className="flex items-center gap-1 rounded-md border border-border px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30"
                  >
                    <ArrowUpDown size={13} />
                    <span className="hidden sm:inline">Reverse</span>
                  </button>
                </div>
                <List videoList={activeList} setVideoList={setActiveList} changeVideo={changeVideo}
                  deleteVideo={deleteFromList} playingVideo={videoId} updateList={updateList} />
              </div>
            )}
          </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-20 right-4 z-[300] flex animate-in items-center gap-3 rounded-xl border px-5 py-3 text-sm font-medium shadow-2xl backdrop-blur-sm duration-300 fade-in slide-in-from-bottom-4 sm:bottom-6 sm:right-6 ${
          toast.type === 'success' ? 'border-emerald-500/40 bg-emerald-950/90 text-emerald-300' :
          toast.type === 'error'   ? 'border-red-500/40 bg-red-950/90 text-red-300' :
                                     'border-border bg-card/90 text-foreground'
        }`}>{toast.msg}</div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      <PromptDialog
        open={showNewPlaylistPrompt}
        title="New playlist"
        label="Playlist name"
        placeholder="My Awesome Playlist"
        submitText="Create"
        onSubmit={name => {
          createLocalPlaylist(name)
          setShowNewPlaylistPrompt(false)
        }}
        onCancel={() => setShowNewPlaylistPrompt(false)}
      />

      <ConfirmDialog
        open={!!deleteLocalTarget}
        title="Delete playlist?"
        message={
          deleteLocalTarget
            ? `Delete "${deleteLocalTarget.name}"? This cannot be undone.`
            : ''
        }
        confirmText="Delete"
        variant="danger"
        onConfirm={() => {
          if (deleteLocalTarget) deleteLocalPlaylist(deleteLocalTarget._id)
          setDeleteLocalTarget(null)
        }}
        onCancel={() => setDeleteLocalTarget(null)}
      />

      <ConfirmDialog
        open={showClearHistoryConfirm}
        title="Clear watch history?"
        message="Remove all recent videos from your history?"
        confirmText="Clear"
        variant="danger"
        onConfirm={() => {
          setHistory([])
          writeLocalJson(LS_HIST, [])
          setShowClearHistoryConfirm(false)
        }}
        onCancel={() => setShowClearHistoryConfirm(false)}
      />
    </div>
  )
}
