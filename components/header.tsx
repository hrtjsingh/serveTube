'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useAppTheme } from '@/context/ThemeContext'
import AuthModal from './AuthModal'
import { LogOut, User, Sun, Moon, Circle } from 'lucide-react'

const THEME_ICONS = { light: Sun, dark: Moon, amoled: Circle }
const THEME_CYCLE = ['dark', 'light', 'amoled'] as const

export function Header() {
  const { user, isSignedIn, logout } = useAuth()
  const { theme, setTheme }          = useAppTheme()
  const [showAuth, setShowAuth]      = useState(false)

  const cycleTheme = () => {
    const idx  = THEME_CYCLE.indexOf(theme as any)
    const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]
    setTheme(next)
  }

  const ThemeIcon = THEME_ICONS[theme as keyof typeof THEME_ICONS] || Moon

  return (
    <>
      <header className="sticky top-0 z-50 flex h-14 sm:h-16 items-center justify-between gap-4 border-b border-border/60 bg-background/80 px-3 sm:px-5 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-x-2 shrink-0">
          <span className="relative flex items-center gap-1 font-extrabold text-xl sm:text-2xl tracking-tight">
            <span className="text-[#f8bf59]">SERVE</span>
            <span className="bg-[#ffe49f] text-[#070707] ml-0.5 px-1 py-0.5 rounded-sm">TUBE</span>
            <span className="ml-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          {/* <button
            onClick={cycleTheme}
            title={`Theme: ${theme}`}
            className="flex items-center justify-center rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ThemeIcon size={15} />
          </button> */}

          {isSignedIn ? (
            <>
              <Link href="/profile"
                className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-muted/40 pl-2 pr-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f8bf59] text-[#070707] font-bold text-xs uppercase">
                  {user?.name?.[0]}
                </div>
                <span className="max-w-[100px] truncate">{user?.name}</span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 rounded-md border border-border px-2.5 sm:px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <LogOut size={14} />
                <span className="hidden sm:block">Sign out</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="flex items-center gap-1.5 rounded-md bg-[#f8bf59] px-3 sm:px-4 py-2 text-sm font-semibold text-[#070707] hover:bg-[#ffe49f] transition-colors shadow-sm"
            >
              <User size={14} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
