'use client'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import YouTube from 'react-youtube'
import List from './List'
import { useAuth } from '@/context/AuthContext'
import { PlaylistManager, PlaylistDoc } from './PlaylistManager'
import axios from 'axios'
import AuthModal from './AuthModal'
import {
  Play, Plus, ListVideo, SkipForward, Trash2,
  AlertCircle, ChevronRight, CloudUpload, CheckCircle2,
  Loader2, WifiOff, Clock, PanelLeftClose, PanelLeftOpen
} from 'lucide-react'

// ── localStorage helpers ──────────────────────────────────────────────────
const LS_PLAYLIST  = 'servetube_local_playlist'
const LS_HIST      = 'servetube_watch_history'
const LS_PLAYLISTS = 'servetube_local_playlists'

const lsGet = (k: string, fallback: any = null) => {
  try { return JSON.parse(localStorage.getItem(k) as string) ?? fallback } catch { return fallback }
}
const lsSet = (k: string, v: any) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

function extractVideoId(link: string): string {
  const re = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ \r\n]{11})/
  const m  = link.match(re)
  return m ? m[1] : link.length === 11 ? link : ''
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 5)  return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}

// ── Guest local playlist shape ────────────────────────────────────────────
interface LocalPlaylist {
  _id: string; name: string; description: string
  coverColor: string; songs: { id: string }[]; isDefault: boolean
}

const DEFAULT_LOCAL: LocalPlaylist = {
  _id: 'local-default', name: 'My Playlist', description: '',
  coverColor: '#f8bf59', songs: [], isDefault: true,
}

export default function VideoPlayer() {
  const { user, isSignedIn, isLoaded } = useAuth()

  const [videoId, setVideoId]   = useState('36AKk9A5gH8')
  const [videoURL, setVideoURL] = useState('')
  const [showAuth, setShowAuth] = useState(false)
  const [toast, setToast]       = useState<{ msg: string; type?: string } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const playerRef = useRef<HTMLDivElement>(null)

  // ── Auth user playlist state ─────────────────────────────────────────────
  const [dbPlaylists, setDbPlaylists]       = useState<PlaylistDoc[]>([])
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null)
  const [isSyncing, setIsSyncing]           = useState(false)
  const [isDirty, setIsDirty]               = useState(false)
  const [lastSynced, setLastSynced]         = useState<number | null>(null)
  const [syncError, setSyncError]           = useState<string | null>(null)
  const initialLoadDone = useRef(false)

  // ── Guest local playlist state ──────────────────────────────────────────
  const [localPlaylists, setLocalPlaylists] = useState<LocalPlaylist[]>(() =>
    lsGet(LS_PLAYLISTS, [DEFAULT_LOCAL])
  )
  const [activeLocalId, setActiveLocalId]   = useState<string>('local-default')
  const [history, setHistory]               = useState<{ id: string; watchedAt: number }[]>(() =>
    lsGet(LS_HIST, [])
  )

  // ── Active song list (derived) ───────────────────────────────────────────
  const activeList: { id: string }[] = isSignedIn
    ? (dbPlaylists.find(p => p._id === activePlaylistId)?.songs || [])
    : (localPlaylists.find(p => p._id === activeLocalId)?.songs || [])

  const setActiveList = (songs: { id: string }[]) => {
    if (isSignedIn) {
      setDbPlaylists(ps => ps.map(p => p._id === activePlaylistId ? { ...p, songs } : p))
      if (initialLoadDone.current) { setIsDirty(true); setSyncError(null) }
    } else {
      setLocalPlaylists(ps => {
        const updated = ps.map(p => p._id === activeLocalId ? { ...p, songs } : p)
        lsSet(LS_PLAYLISTS, updated)
        return updated
      })
    }
  }

  // Persist history
  useEffect(() => { lsSet(LS_HIST, history) }, [history])

  // On auth change
  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      const saved = lsGet(LS_PLAYLISTS, [DEFAULT_LOCAL])
      setLocalPlaylists(saved.length ? saved : [DEFAULT_LOCAL])
      setActiveLocalId(saved[0]?._id || 'local-default')
      initialLoadDone.current = false
    } else {
      loadUserPlaylists()
    }
  }, [isLoaded, isSignedIn])

  const showToast = useCallback((msg: string, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const addToHistory = (id: string) =>
    setHistory(h => [{ id, watchedAt: Date.now() }, ...h.filter(x => x.id !== id)].slice(0, 50))

  // ── Load user playlists from DB ──────────────────────────────────────────
  const loadUserPlaylists = async () => {
    try {
      const me = await axios.get('/api/users/save')
      if (!me.data.user) return
      const uid = me.data.user._id
      const res = await axios.get(`/api/users/${uid}`)
      const ps: PlaylistDoc[] = res.data.playlist || []

      const localList = lsGet(LS_PLAYLIST, [])

      if (ps.length === 0) {
        // Create default playlist, optionally seeding from local storage
        const seeds = localList.length ? localList : [{ id: '36AKk9A5gH8' }]
        const cr = await axios.post('/api/playlists/add', {
          userId: uid, songs: seeds, name: 'My Playlist', isDefault: true
        })
        const created = cr.data.playlist
        initialLoadDone.current = true
        setDbPlaylists([created])
        setActivePlaylistId(created._id)
        setLastSynced(Date.now()); setIsDirty(false)
        if (localList.length) lsSet(LS_PLAYLIST, [])
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
          lsSet(LS_PLAYLIST, [])
        }
        initialLoadDone.current = true
        setDbPlaylists(ps)
        setActivePlaylistId(ps[0]._id)
        setLastSynced(Date.now()); setIsDirty(false)
      }
    } catch { showToast('Could not load playlists', 'error') }
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
      axios.post(`/api/playlists/${activePlaylistId}/add-song`, JSON.stringify({ id: videoId }))
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

  const updateList = async (list: any) => {
    setActiveList(list)
    if (isSignedIn && activePlaylistId) {
      try {
        await axios.post(`/api/playlists/${activePlaylistId}/update`, { songs: list })
        setIsDirty(false); setLastSynced(Date.now())
      } catch { setIsDirty(true) }
    }
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
    if (!id) { showToast('Invalid YouTube URL or video ID', 'error'); return }
    setVideoId(id); setVideoURL(''); addToHistory(id)
  }

  const changeVideo = (id: string) => { setVideoId(id); addToHistory(id) }

  const playNext = () => {
    if (!activeList.length) return
    const idx  = activeList.findIndex((v: any) => v.id === videoId)
    const next = activeList[idx < activeList.length - 1 ? idx + 1 : 0]
    changeVideo(next.id)
  }

  const alreadyInList = activeList.some((v: any) => v.id === videoId)

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
    setLocalPlaylists(updated); lsSet(LS_PLAYLISTS, updated)
    setActiveLocalId(newP._id)
    showToast(`Playlist "${name}" created ✓`, 'success')
  }
  const deleteLocalPlaylist = (id: string) => {
    const remaining = localPlaylists.filter(p => p._id !== id)
    if (!remaining.length) {
      const def = { ...DEFAULT_LOCAL }
      setLocalPlaylists([def]); lsSet(LS_PLAYLISTS, [def]); setActiveLocalId(def._id)
    } else {
      setLocalPlaylists(remaining); lsSet(LS_PLAYLISTS, remaining)
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
    ? 'bg-[#f8bf59] border-[#f8bf59] text-[#070707] hover:bg-[#ffe49f] shadow-md'
    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">

      {/* ── URL bar ── */}
      <form onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-center gap-3 rounded-xl border border-border bg-card p-3 sm:p-4 shadow-sm">
        <div className="relative flex-1 w-full">
          <Play size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Paste YouTube URL or video ID…" value={videoURL}
            onChange={e => setVideoURL(e.target.value)}
            className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#f8bf59] transition-colors placeholder:text-muted-foreground" />
        </div>
        <button type="submit" disabled={!videoURL.trim()}
          className="flex items-center gap-2 rounded-lg bg-[#f8bf59] px-5 py-2.5 text-sm font-bold text-[#070707] hover:bg-[#ffe49f] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm whitespace-nowrap w-full sm:w-auto justify-center">
          <Play size={14} /> Play Video
        </button>
      </form>

      {/* ── Player + Sidebar ── */}
      <div className="flex gap-4">

        {/* Player column */}
        <div className="flex-1 min-w-0 space-y-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-lg">
            <div ref={playerRef} className="relative bg-black w-full aspect-video">
              <div className="absolute -inset-4 opacity-30 blur-3xl bg-gradient-to-br from-yellow-500 via-red-500 to-purple-600 animate-pulse pointer-events-none" />
              <div className="relative w-full h-full">
                <YouTube className="w-full h-full" videoId={videoId}
                  opts={{ width: '100%', height: '100%', playerVars: { autoplay: 1, rel: 0, modestbranding: 1 } }}
                  onEnd={playNext} />
              </div>
            </div>
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-t border-border">
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded select-all">{videoId}</span>
              <div className="ml-auto flex items-center gap-2">
                <button onClick={() => setSidebarOpen(s => !s)}
                  className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  {sidebarOpen ? <PanelLeftClose size={13} /> : <PanelLeftOpen size={13} />}
                </button>
                <button onClick={playNext} disabled={activeList.length < 2}
                  className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30">
                  <SkipForward size={13} /> Next
                </button>
                <button onClick={alreadyInList ? undefined : addToList} disabled={alreadyInList}
                  className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <Plus size={13} /> {alreadyInList ? 'In Playlist' : 'Add to Playlist'}
                </button>
              </div>
            </div>
          </div>

          {/* Guest banner */}
          {!isSignedIn && isLoaded && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm">
              <div className="flex items-center gap-2 text-blue-300">
                <AlertCircle size={15} />
                <span className="text-xs sm:text-sm">Playlist saved locally.</span>
              </div>
              <button onClick={() => setShowAuth(true)}
                className="flex items-center gap-1.5 rounded-md bg-blue-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-400 transition-colors whitespace-nowrap">
                Sync to cloud <ChevronRight size={12} />
              </button>
            </div>
          )}

          {/* Watch History (guests) */}
          {!isSignedIn && history.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Recent</h3>
                <button onClick={() => { setHistory([]); lsSet(LS_HIST, []) }}
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
          )}
        </div>

        {/* ── Sidebar ── */}
        {sidebarOpen && (
          <div className="hidden lg:flex w-[360px] xl:w-[400px] flex-shrink-0 flex-col gap-3">

            {/* ── Playlist Manager (auth users) ── */}
            {isSignedIn && user && (
              <div className="rounded-xl border border-border bg-card p-4">
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
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold flex items-center gap-1.5">
                    <ListVideo size={14} className="text-[#f8bf59]" /> Playlists
                    <span className="rounded-full bg-[#f8bf59]/20 text-[#f8bf59] text-xs font-bold px-2 py-0.5">{localPlaylists.length}</span>
                  </span>
                  <button
                    onClick={() => {
                      const name = prompt('Playlist name:')
                      if (name?.trim()) createLocalPlaylist(name.trim())
                    }}
                    className="flex items-center gap-1 rounded-md bg-[#f8bf59] px-2 py-1.5 text-xs font-bold text-[#070707] hover:bg-[#ffe49f] transition-colors">
                    <Plus size={12} /> New
                  </button>
                </div>
                <div className="space-y-1">
                  {localPlaylists.map(p => (
                    <div key={p._id}
                      onClick={() => setActiveLocalId(p._id)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-all ${
                        p._id === activeLocalId ? 'border-[#f8bf59]/40 bg-[#f8bf59]/10' : 'border-border hover:bg-muted/30'
                      }`}>
                      <div className="h-6 w-6 rounded-md flex items-center justify-center" style={{ background: p.coverColor }}>
                        <ListVideo size={11} className="text-white" />
                      </div>
                      <span className="flex-1 text-sm font-medium truncate">{p.name}</span>
                      <span className="text-xs text-muted-foreground">{p.songs.length}</span>
                      {localPlaylists.length > 1 && (
                        <button onClick={e => { e.stopPropagation(); deleteLocalPlaylist(p._id) }}
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
                      {lastSynced && !isDirty && !syncError && (
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
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
              <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <ListVideo size={15} className="text-[#f8bf59]" />
                    <span className="text-sm font-bold">Queue</span>
                    <span className="rounded-full bg-[#f8bf59]/20 text-[#f8bf59] text-xs font-bold px-2 py-0.5">{activeList.length}</span>
                  </div>
                  {/* <button onClick={clearPlaylist}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 size={12} /> Clear
                  </button> */}
                </div>
                <List videoList={activeList} setVideoList={setActiveList} changeVideo={changeVideo}
                  deleteVideo={deleteFromList} playingVideo={videoId} updateList={updateList} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[300] flex items-center gap-3 rounded-xl border px-5 py-3 text-sm font-medium shadow-2xl backdrop-blur-sm transition-all ${
          toast.type === 'success' ? 'border-emerald-500/40 bg-emerald-950/90 text-emerald-300' :
          toast.type === 'error'   ? 'border-red-500/40 bg-red-950/90 text-red-300' :
                                     'border-border bg-card/90 text-foreground'
        }`}>{toast.msg}</div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}
