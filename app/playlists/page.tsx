'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { PlaylistDoc } from '@/components/PlaylistManager'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import {
  ListVideo, Play, Plus, Loader2, Music2
} from 'lucide-react'
import AuthModal from '@/components/AuthModal'
import { EmptyState } from '@/components/ui/empty-state'
import { GuestBanner } from '@/components/ui/guest-banner'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'

import { loadLocalPlaylistsFromStorage } from '@/lib/localPlaylists'

export default function PlaylistsPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()
  const [playlists, setPlaylists] = useState<PlaylistDoc[]>([])
  const [loading, setLoading]     = useState(true)
  const [showAuth, setShowAuth]   = useState(false)

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      const { playlists } = loadLocalPlaylistsFromStorage()
      setPlaylists(playlists as PlaylistDoc[])
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
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <Loader2 size={28} className="animate-spin text-brand" />
      <p className="text-sm text-muted-foreground">Loading playlists…</p>
    </div>
  )

  return (
    <div className="st-page">
      <PageHeader
        title="My Playlists"
        subtitle={`${playlists.length} playlist${playlists.length !== 1 ? 's' : ''} · ${totalSongs} videos total`}
        action={
          <Button variant="brand" onClick={() => router.push('/')}>
            <Plus size={14} /> New Playlist
          </Button>
        }
      />

      {!isSignedIn && (
        <GuestBanner onAction={() => setShowAuth(true)} />
      )}

      {playlists.length === 0 ? (
        <EmptyState
          icon={Music2}
          title="No playlists yet"
          description="Go to the home page to create your first playlist."
          action={{ label: 'Create Playlist', onClick: () => router.push('/'), icon: Plus }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map(p => (
            <div
              key={p._id}
              onClick={() => router.push('/')}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-brand/20 hover:shadow-lg hover:shadow-brand/5"
            >
              <div
                className="relative flex h-28 w-full items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${p.coverColor}30, ${p.coverColor}10)` }}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg"
                  style={{ background: p.coverColor }}>
                  <ListVideo size={24} className="text-white" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                    <Play size={20} className="fill-white text-white" />
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h3 className="truncate font-bold">{p.name}</h3>
                {p.description && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{p.description}</p>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {p.songs.length} video{p.songs.length !== 1 ? 's' : ''}
                  </span>
                  {!isSignedIn && (
                    <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-400">Local</span>
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
