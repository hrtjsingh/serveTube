'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { PlaylistDoc } from '@/components/PlaylistManager'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import {
  ListVideo, Play, Plus, Loader2, Lock, Music2
} from 'lucide-react'
import AuthModal from '@/components/AuthModal'

const LS_PLAYLISTS = 'servetube_local_playlists'
const lsGet = (k: string, fb: any = null) => { try { return JSON.parse(localStorage.getItem(k) as string) ?? fb } catch { return fb } }

export default function PlaylistsPage() {
  const { user, isSignedIn, isLoaded } = useAuth()
  const router = useRouter()
  const [playlists, setPlaylists] = useState<PlaylistDoc[]>([])
  const [loading, setLoading]     = useState(true)
  const [showAuth, setShowAuth]   = useState(false)

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      setPlaylists(lsGet(LS_PLAYLISTS, []))
      setLoading(false)
      return
    }
    const load = async () => {
      try {
        const me  = await axios.get('/api/users/save')
        const uid = me.data.user?._id
        if (!uid) return
        const res = await axios.get(`/api/users/${uid}`)
        setPlaylists(res.data.playlist || [])
      } catch {} finally { setLoading(false) }
    }
    load()
  }, [isLoaded, isSignedIn])

  const totalSongs = playlists.reduce((s, p) => s + p.songs.length, 0)

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 size={28} className="animate-spin text-muted-foreground" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 sm:pb-10 space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">My Playlists</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {playlists.length} playlist{playlists.length !== 1 ? 's' : ''} · {totalSongs} videos total
          </p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 rounded-lg bg-[#f8bf59] px-4 py-2 text-sm font-bold text-[#070707] hover:bg-[#ffe49f] transition-colors shadow-sm"
        >
          <Plus size={14} /> New Playlist
        </button>
      </div>

      {/* Guest banner */}
      {!isSignedIn && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3">
          <div className="flex items-center gap-2 text-blue-300 text-sm">
            <Lock size={14} />
            <span>Local playlists only. Sign in to sync.</span>
          </div>
          <button onClick={() => setShowAuth(true)}
            className="flex items-center gap-1.5 rounded-md bg-blue-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-400 transition-colors whitespace-nowrap">
            Sign in
          </button>
        </div>
      )}

      {/* Playlist grid */}
      {playlists.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
          <Music2 size={40} className="opacity-20" />
          <h2 className="text-lg font-bold text-foreground">No playlists yet</h2>
          <p className="text-sm">Go to the home page to create your first playlist.</p>
          <button onClick={() => router.push('/')}
            className="mt-2 flex items-center gap-2 rounded-lg bg-[#f8bf59] px-4 py-2 text-sm font-bold text-[#070707] hover:bg-[#ffe49f] transition-colors">
            <Plus size={14} /> Create Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map(p => (
            <div
              key={p._id}
              onClick={() => router.push('/')}
              className="group relative rounded-2xl border border-border bg-card overflow-hidden cursor-pointer hover:border-border/80 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              {/* Cover */}
              <div
                className="h-28 w-full flex items-center justify-center relative"
                style={{ background: `linear-gradient(135deg, ${p.coverColor}30, ${p.coverColor}10)` }}
              >
                <div className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: p.coverColor }}>
                  <ListVideo size={24} className="text-white" />
                </div>
                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                    <Play size={20} className="text-white fill-white" />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold truncate">{p.name}</h3>
                {p.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.description}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {p.songs.length} video{p.songs.length !== 1 ? 's' : ''}
                  </span>
                  {!isSignedIn && (
                    <span className="text-[10px] bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full font-semibold">Local</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}
