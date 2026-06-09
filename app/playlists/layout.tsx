import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/seo'

export const metadata: Metadata = createPageMetadata({
  title: 'Playlists',
  description:
    'Manage your ad-free YouTube and YouTube Music playlists on ServeTube. Import, organize, and play only the videos you choose.',
  path: '/playlists',
})

export default function PlaylistsLayout({ children }: { children: React.ReactNode }) {
  return children
}
