import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    {
      url: absoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: absoluteUrl('/playlists'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]
}
