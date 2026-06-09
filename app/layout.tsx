import { AuthProvider } from '@/context/AuthContext'
import { PlayerProvider } from '@/context/PlayerContext'
import { AppThemeProvider } from '@/context/ThemeContext'
import { GlobalPlayer } from '@/components/GlobalPlayer'
import { ResumePlaybackPrompt } from '@/components/ResumePlaybackPrompt'
import { PwaViewportFix } from '@/components/PwaViewportFix'
import { Header } from '@/components/header'
import { MobileNav } from '@/components/MobileNav'
import { ThemeProvider } from '@/components/theme-provider'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#f8bf59',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'ServeTube — Ad-free, distraction-free YouTube',
  description:
    'Ad-free, distraction-free YouTube player. Watch only what you want — your playlists and picks, not the algorithm feed.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'ServeTube' },
  other: { 'mobile-web-app-capable': 'yes' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full dark" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/logo192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=5"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background flex min-h-full flex-col antialiased pb-16 lg:pb-0`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <PwaViewportFix />
          <AuthProvider>
            <PlayerProvider>
              <AppThemeProvider>
                <Header />
                <main className="flex-1">{children}</main>
                <GlobalPlayer />
                <ResumePlaybackPrompt />
                <MobileNav />
              </AppThemeProvider>
            </PlayerProvider>
          </AuthProvider>
        </ThemeProvider>
        
      </body>
    </html>
  )
}
