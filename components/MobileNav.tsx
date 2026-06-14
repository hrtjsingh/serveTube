'use client'
import { usePathname, useRouter } from 'next/navigation'
import { Home, ListVideo, History, Settings, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'
import AuthModal from './AuthModal'
import { cn } from '@/lib/utils'

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

  const NavButton = ({
    active,
    onClick,
    icon: Icon,
    label,
    children,
  }: {
    active: boolean
    onClick: () => void
    icon?: typeof Home
    label: string
    children?: React.ReactNode
  }) => (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors',
        active ? 'text-brand' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {active && (
        <span className="absolute top-1 h-1 w-5 rounded-full bg-brand" />
      )}
      {children ?? (Icon && <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />)}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  )

  return (
    <>
      <nav className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-50 flex h-16 border-t border-border/60 bg-background/90 backdrop-blur-xl safe-bottom lg:hidden">
        {NAV.map(({ label, icon: Icon, href }) => (
          <NavButton
            key={href}
            active={pathname === href}
            onClick={() => router.push(href)}
            icon={Icon}
            label={label}
          />
        ))}
        <NavButton
          active={pathname === '/profile'}
          onClick={() => isSignedIn ? router.push('/profile') : setShowAuth(true)}
          label={isSignedIn ? 'Profile' : 'Sign In'}
        >
          {isSignedIn ? (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-brand-foreground">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          ) : (
            <User size={20} strokeWidth={pathname === '/profile' ? 2.5 : 1.8} />
          )}
        </NavButton>
      </nav>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
