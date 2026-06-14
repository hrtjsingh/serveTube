'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ListVideo, History, Settings, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Home',      icon: Home,      href: '/'          },
  { label: 'Playlists', icon: ListVideo, href: '/playlists' },
  { label: 'History',   icon: History,   href: '/history'   },
  { label: 'Settings',  icon: Settings,  href: '/settings'  },
]

export function DesktopNav() {
  const pathname = usePathname()
  const { isSignedIn, user } = useAuth()

  return (
    <aside className="sticky top-14 z-40 hidden h-[calc(100vh-3.5rem)] w-52 shrink-0 flex-col border-r border-brand/10 bg-background/50 px-3 py-5 backdrop-blur-xl sm:top-16 lg:flex xl:w-56">
      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map(({ label, icon: Icon, href }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'border border-brand/25 bg-brand/12 text-brand shadow-sm shadow-brand/10'
                  : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
              )}
            >
              <Icon size={18} strokeWidth={active ? 2.25 : 1.75} />
              {label}
            </Link>
          )
        })}

        <div className="my-3 h-px bg-border" />

        <Link
          href="/profile"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            pathname === '/profile'
              ? 'border border-brand/25 bg-brand/12 text-brand'
              : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
          )}
        >
          {isSignedIn ? (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-brand-foreground">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          ) : (
            <User size={18} />
          )}
          {isSignedIn ? (user?.name?.split(' ')[0] ?? 'Profile') : 'Sign In'}
        </Link>
      </nav>

      <p className="st-jp px-2 text-[10px] tracking-widest text-muted-foreground/60">
        武士道
      </p>
    </aside>
  )
}
