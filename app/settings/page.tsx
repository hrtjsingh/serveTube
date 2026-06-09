'use client'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { useAuth } from '@/context/AuthContext'
import { useAppTheme } from '@/context/ThemeContext'
import { Palette, Bell, Shield, Info, ChevronRight, RotateCcw } from 'lucide-react'

export default function SettingsPage() {
  const { user, isSignedIn } = useAuth()
  const { theme } = useAppTheme()

  const resetOnboarding = () => {
    localStorage.removeItem('st_onboarded')
    window.location.href = '/'
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 sm:pb-10 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ad-free, distraction-free YouTube — your picks, not the algorithm.
        </p>
      </div>

      {/* Theme */}
      <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-purple-500/10 p-2.5">
            <Palette size={18} className="text-purple-400" />
          </div>
          <div>
            <h2 className="font-bold">Appearance</h2>
            <p className="text-xs text-muted-foreground">Choose your display theme</p>
          </div>
        </div>
        <ThemeSwitcher />
        <p className="text-xs text-muted-foreground">
          Current: <span className="font-semibold text-foreground capitalize">{theme}</span>
          {theme === 'amoled' && ' — True black background, saves battery on OLED screens'}
          {theme === 'dark'   && ' — Easy on the eyes in low light'}
          {theme === 'light'  && ' — Bright and clean'}
        </p>
      </section>

      {/* Account */}
      <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-xl bg-blue-500/10 p-2.5">
            <Shield size={18} className="text-blue-400" />
          </div>
          <div>
            <h2 className="font-bold">Account</h2>
            <p className="text-xs text-muted-foreground">Your account information</p>
          </div>
        </div>
        {isSignedIn ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="text-sm font-semibold">{user?.name}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-semibold">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
              <span className="text-sm text-muted-foreground">Sync</span>
              <span className="text-xs font-semibold bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full">Active</span>
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-muted/40 px-4 py-4 text-center">
            <p className="text-sm text-muted-foreground mb-3">Sign in to sync playlists across devices</p>
            <a href="/" className="inline-flex items-center gap-1.5 rounded-lg bg-[#f8bf59] px-4 py-2 text-xs font-bold text-[#070707] hover:bg-[#ffe49f] transition-colors">
              Sign In / Register <ChevronRight size={13} />
            </a>
          </div>
        )}
      </section>

      {/* About */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-xl bg-yellow-500/10 p-2.5">
            <Info size={18} className="text-[#f8bf59]" />
          </div>
          <div>
            <h2 className="font-bold">About</h2>
            <p className="text-xs text-muted-foreground">ServeTube info & actions</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
            <span className="text-sm text-muted-foreground">Version</span>
            <span className="text-sm font-semibold">2.0.0</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
            <span className="text-sm text-muted-foreground">PWA</span>
            <span className="text-xs font-semibold bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full">Installable</span>
          </div>
          <button
            onClick={resetOnboarding}
            className="flex w-full items-center justify-between rounded-lg bg-muted/40 px-4 py-3 hover:bg-muted/60 transition-colors"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RotateCcw size={14} /> Replay onboarding tour
            </div>
            <ChevronRight size={14} className="text-muted-foreground" />
          </button>
        </div>
      </section>
    </div>
  )
}
