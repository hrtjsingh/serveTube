'use client'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { User, ListVideo, History, LogOut, Settings, ChevronRight, Music2 } from 'lucide-react'
import AuthModal from '@/components/AuthModal'

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
        setSongCount(pls.reduce((s: number, p: any) => s + p.songs.length, 0))
      } catch {}
    }
    load()
  }, [isSignedIn, user])

  if (!isLoaded) return null

  if (!isSignedIn) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 pb-24">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
        <User size={28} className="text-muted-foreground" />
      </div>
      <h2 className="text-xl font-bold">Not signed in</h2>
      <p className="text-sm text-muted-foreground text-center">Sign in to sync playlists and access your profile</p>
      <button onClick={() => setShowAuth(true)}
        className="flex items-center gap-2 rounded-lg bg-[#f8bf59] px-5 py-2.5 text-sm font-bold text-[#070707] hover:bg-[#ffe49f] transition-colors">
        Sign In / Register
      </button>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )

  const STATS = [
    { label: 'Playlists', value: plCount, icon: Music2, color: 'text-[#f8bf59]', bg: 'bg-[#f8bf59]/10' },
    { label: 'Videos',    value: songCount, icon: ListVideo, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Watched',   value: histCount, icon: History, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  ]

  const LINKS = [
    { label: 'My Playlists', href: '/playlists', icon: ListVideo },
    { label: 'Watch History', href: '/history',  icon: History  },
    { label: 'Settings',      href: '/settings', icon: Settings },
  ]

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-24 sm:pb-10 space-y-6">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="h-20 w-20 rounded-full bg-[#f8bf59] flex items-center justify-center text-3xl font-extrabold text-[#070707] shadow-lg">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div className="text-center">
          <h1 className="text-xl font-extrabold">{user?.name}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-4 text-center">
            <div className={`inline-flex rounded-xl p-2 mb-2 ${bg}`}>
              <Icon size={16} className={color} />
            </div>
            <p className="text-2xl font-extrabold">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {LINKS.map(({ label, href, icon: Icon }, i) => (
          <button key={href} onClick={() => router.push(href)}
            className={`flex w-full items-center gap-3 px-5 py-4 hover:bg-muted/30 transition-colors ${i !== LINKS.length - 1 ? 'border-b border-border' : ''}`}>
            <Icon size={16} className="text-muted-foreground" />
            <span className="flex-1 text-sm font-medium text-left">{label}</span>
            <ChevronRight size={14} className="text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Sign out */}
      <button
        onClick={async () => { await logout(); router.push('/') }}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3.5 text-sm font-semibold text-destructive hover:bg-destructive/20 transition-colors"
      >
        <LogOut size={15} /> Sign Out
      </button>
    </div>
  )
}
