'use client'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { User, ListVideo, History, LogOut, Settings, ChevronRight, Music2, Loader2 } from 'lucide-react'
import AuthModal from '@/components/AuthModal'
import { Button } from '@/components/ui/button'

import { readLocalJson } from '@/lib/storage'

const LS_HIST = 'servetube_watch_history'

export default function ProfilePage() {
  const { user, isSignedIn, isLoaded, logout } = useAuth()
  const router  = useRouter()
  const [showAuth, setShowAuth]   = useState(false)
  const [plCount, setPlCount]     = useState(0)
  const [songCount, setSongCount] = useState(0)
  const [histCount, setHistCount] = useState(0)

  useEffect(() => {
    setHistCount(readLocalJson(LS_HIST, []).length)
  }, [])

  useEffect(() => {
    if (!isSignedIn || !user) return
    const load = async () => {
      try {
        const me  = await axios.get('/api/users/save')
        const uid = me.data.user?._id
        if (!uid) return
        const res = await axios.get(`/api/users/${uid}`)
        const pls = res.data.playlist || []
        setPlCount(pls.length)
        setSongCount(pls.reduce((s: number, p: { songs: unknown[] }) => s + p.songs.length, 0))
      } catch {}
    }
    load()
  }, [isSignedIn, user])

  if (!isLoaded) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <Loader2 size={28} className="animate-spin text-brand" />
      <p className="text-sm text-muted-foreground">Loading profile…</p>
    </div>
  )

  if (!isSignedIn) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 pb-24">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/60">
        <User size={28} className="text-muted-foreground" />
      </div>
      <h2 className="text-xl font-bold">Not signed in</h2>
      <p className="max-w-xs text-center text-sm text-muted-foreground">Sign in to sync playlists and access your profile</p>
      <Button variant="brand" onClick={() => setShowAuth(true)}>
        Sign In / Register
      </Button>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )

  const STATS = [
    { label: 'Playlists', value: plCount, icon: Music2, color: 'text-brand', bg: 'bg-brand/10' },
    { label: 'Videos',    value: songCount, icon: ListVideo, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Watched',   value: histCount, icon: History, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  ]

  const LINKS = [
    { label: 'My Playlists', href: '/playlists', icon: ListVideo },
    { label: 'Watch History', href: '/history',  icon: History  },
    { label: 'Settings',      href: '/settings', icon: Settings },
  ]

  return (
    <div className="st-page max-w-lg">
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand text-3xl font-extrabold text-brand-foreground shadow-lg shadow-brand/20">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div className="text-center">
          <h1 className="text-xl font-extrabold">{user?.name}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="st-card rounded-2xl p-4 text-center">
            <div className={`st-icon-box mb-2 ${bg}`}>
              <Icon size={16} className={color} />
            </div>
            <p className="text-2xl font-extrabold">{value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {LINKS.map(({ label, href, icon: Icon }, i) => (
          <button key={href} onClick={() => router.push(href)}
            className={`flex w-full items-center gap-3 px-5 py-4 transition-colors hover:bg-muted/30 ${i !== LINKS.length - 1 ? 'border-b border-border' : ''}`}>
            <Icon size={16} className="text-muted-foreground" />
            <span className="flex-1 text-left text-sm font-medium">{label}</span>
            <ChevronRight size={14} className="text-muted-foreground" />
          </button>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={async () => { await logout(); router.push('/') }}
        className="w-full border-destructive/30 bg-destructive/10 py-3.5 text-destructive hover:bg-destructive/20"
      >
        <LogOut size={15} /> Sign Out
      </Button>
    </div>
  )
}
