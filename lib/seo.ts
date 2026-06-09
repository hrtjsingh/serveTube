import type { Metadata } from 'next'

export const SITE_NAME = 'ServeTube'
export const SITE_TAGLINE = 'Ad-free, distraction-free YouTube'
export const SITE_DESCRIPTION =
  'Ad-free, distraction-free YouTube and YouTube Music player. Build playlists, skip the algorithm feed, and watch only what you choose — free in your browser or as a PWA.'

export const SITE_KEYWORDS = [
  'ad-free YouTube',
  'distraction-free YouTube',
  'YouTube player',
  'YouTube Music player',
  'YouTube playlist',
  'no algorithm YouTube',
  'watch YouTube without ads',
  'YouTube PWA',
  'custom YouTube queue',
  'ServeTube',
]

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
}

export function absoluteUrl(path: string): string {
  return `${getSiteUrl()}${path.startsWith('/') ? path : `/${path}`}`
}

type PageMetadataOptions = {
  title: string
  description?: string
  path: string
  noIndex?: boolean
}

export function createPageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path,
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const url = absoluteUrl(path)
  const pageTitle = path === '/' ? `${SITE_NAME} — ${SITE_TAGLINE}` : `${title} | ${SITE_NAME}`

  return {
    title: pageTitle,
    description,
    keywords: SITE_KEYWORDS,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url,
      siteName: SITE_NAME,
      title: pageTitle,
      description,
      images: [
        {
          url: '/logo512.png',
          width: 512,
          height: 512,
          alt: `${SITE_NAME} logo`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: ['/logo512.png'],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
  }
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { email: false, address: false, telephone: false },
  ...createPageMetadata({ title: SITE_NAME, path: '/' }),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: SITE_NAME,
  },
  category: 'entertainment',
}
