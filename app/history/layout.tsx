import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/seo'

export const metadata: Metadata = createPageMetadata({
  title: 'Watch History',
  description: 'Your personal ServeTube watch history.',
  path: '/history',
  noIndex: true,
})

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return children
}
