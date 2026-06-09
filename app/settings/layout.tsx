import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/seo'

export const metadata: Metadata = createPageMetadata({
  title: 'Settings',
  description: 'Customize your ServeTube experience.',
  path: '/settings',
  noIndex: true,
})

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children
}
