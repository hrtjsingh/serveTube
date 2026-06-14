'use client'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { useAuth } from '@/context/AuthContext'
import { useAppTheme } from '@/context/ThemeContext'
import { Palette, Shield, Info, ChevronRight, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  const { user, isSignedIn } = useAuth()
  const { theme } = useAppTheme()

  const resetOnboarding = () => {
    localStorage.removeItem('st_onboarded')
    window.location.href = '/'
  }

  return (
    <div className="st-page max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ad-free, distraction-free YouTube — your picks, not the algorithm.
        </p>
      </div>

      <section className="st-section">
        <div className="flex items-center gap-3">
          <div className="st-icon-box bg-purple-500/10">
            <Palette size={18} className="text-purple-400" />
          </div>
          <div>
            <h2 className="font-bold">Appearance</h2>
            <p className="text-xs text-muted-foreground">Choose your display theme</p>
          </div>
        </div>
        <ThemeSwitcher />
        <p className="text-xs text-muted-foreground">
          Current: <span className="font-semibold capitalize text-foreground">{theme}</span>
          {theme === 'amoled' && ' — True black background, saves battery on OLED screens'}
          {theme === 'dark'   && ' — Easy on the eyes in low light'}
          {theme === 'light'  && ' — Bright and clean'}
        </p>
      </section>

      <section className="st-section">
        <div className="mb-4 flex items-center gap-3">
          <div className="st-icon-box bg-blue-500/10">
            <Shield size={18} className="text-blue-400" />
          </div>
          <div>
            <h2 className="font-bold">Account</h2>
            <p className="text-xs text-muted-foreground">Your account information</p>
          </div>
        </div>
        {isSignedIn ? (
          <div className="space-y-2">
            {[
              { label: 'Name', value: user?.name },
              { label: 'Email', value: user?.email },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-semibold">{value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
              <span className="text-sm text-muted-foreground">Sync</span>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-400">Active</span>
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-muted/40 px-4 py-4 text-center">
            <p className="mb-3 text-sm text-muted-foreground">Sign in to sync playlists across devices</p>
            <Button variant="brand" size="sm" asChild>
              <a href="/">
                Sign In / Register <ChevronRight size={13} />
              </a>
            </Button>
          </div>
        )}
      </section>

      <section className="st-section">
        <div className="mb-4 flex items-center gap-3">
          <div className="st-icon-box bg-brand/10">
            <Info size={18} className="text-brand" />
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
            <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-semibold text-blue-400">Installable</span>
          </div>
          <button
            onClick={resetOnboarding}
            className="flex w-full items-center justify-between rounded-lg bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/60"
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
