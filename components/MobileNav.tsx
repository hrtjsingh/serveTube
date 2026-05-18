'use client'
import { usePathname, useRouter } from 'next/navigation'
import { Home, ListVideo, History, Settings, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'
import AuthModal from './AuthModal'

const NAV = [
  { label: 'Home',      icon: Home,      href: '/'          },
  { label: 'Playlists', icon: ListVideo,  href: '/playlists' },
  { label: 'History',   icon: History,    href: '/history'   },
  { label: 'Settings',  icon: Settings,   href: '/settings'  },
]

export function MobileNav() {
  const pathname    = usePathname()
  const router      = useRouter()
  const { isSignedIn, user } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex sm:hidden h-16 border-t border-border bg-background/95 backdrop-blur-md">
        {NAV.map(({ label, icon: Icon, href }) => {
          const active = pathname === href
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
                active ? 'text-[#f8bf59]' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          )
        })}
        {/* Profile / Sign in */}
        <button
          onClick={() => isSignedIn ? router.push('/profile') : setShowAuth(true)}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
            pathname === '/profile' ? 'text-[#f8bf59]' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {isSignedIn ? (
            <div className="h-5 w-5 rounded-full bg-[#f8bf59] flex items-center justify-center text-[#070707] text-[10px] font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          ) : (
            <User size={20} strokeWidth={1.8} />
          )}
          <span className="text-[10px] font-medium">{isSignedIn ? 'Profile' : 'Sign In'}</span>
        </button>
      </nav>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
