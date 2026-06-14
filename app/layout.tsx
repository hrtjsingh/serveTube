import { AuthProvider } from '@/context/AuthContext'
import { PlayerProvider } from '@/context/PlayerContext'
import { AppThemeProvider } from '@/context/ThemeContext'
import { GlobalPlayer } from '@/components/GlobalPlayer'
import { ResumePlaybackPrompt } from '@/components/ResumePlaybackPrompt'
import { PwaViewportFix } from '@/components/PwaViewportFix'
import { BackgroundAnimation } from '@/components/BackgroundAnimation'
import { Header } from '@/components/header'
import { MobileNav } from '@/components/MobileNav'
import { ThemeProvider } from '@/components/theme-provider'
import type { Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { rootMetadata } from '@/lib/seo'
import './globals.css'

export const metadata = rootMetadata

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#f8bf59',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full dark" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="icon" href="/logo192.png" type="image/png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-full flex-col antialiased pb-16 lg:pb-0`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <BackgroundAnimation />
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
