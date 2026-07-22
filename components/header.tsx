'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useAppTheme } from '@/context/ThemeContext'
import AuthModal from './AuthModal'
import { BrandLogo } from './BrandLogo'
import { LogOut, User, Sun, Moon, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const THEME_ICONS = { light: Sun, dark: Moon, amoled: Circle }
const THEME_CYCLE = ['dark', 'light', 'amoled'] as const

export function Header() {
  const { user, isSignedIn, logout } = useAuth()
  const { theme, setTheme }          = useAppTheme()
  const [showAuth, setShowAuth]      = useState(false)

  const cycleTheme = () => {
    const idx  = THEME_CYCLE.indexOf(theme as typeof THEME_CYCLE[number])
    const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]
    setTheme(next)
  }

  const ThemeIcon = THEME_ICONS[theme as keyof typeof THEME_ICONS] || Moon

  return (
    <>
      <header className="st-glass sticky top-0 z-50 flex h-14 sm:h-16 items-center justify-between gap-4 border-b border-brand/10 px-3 sm:px-5">
        <Link href="/" className="group flex shrink-0 items-center gap-x-2 transition-opacity hover:opacity-90">
          <BrandLogo interactive />
        </Link>

        <div className="flex items-center gap-2">
          {/* <button
            onClick={cycleTheme}
            title={`Theme: ${theme}`}
            className="hidden sm:flex items-center justify-center rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <ThemeIcon size={15} />
          </button> */}

          {isSignedIn ? (
            <>
              <Link href="/profile"
                className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-muted/40 pl-2 pr-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-bold uppercase text-brand-foreground">
                  {user?.name?.[0]}
                </div>
                <span className="max-w-[100px] truncate">{user?.name}</span>
              </Link>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut size={14} />
                <span className="hidden sm:block">Sign out</span>
              </Button>
            </>
          ) : (
            <Button variant="brand" size="sm" onClick={() => setShowAuth(true)}>
              <User size={14} />
              <span>Sign In</span>
            </Button>
          )}
        </div>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
