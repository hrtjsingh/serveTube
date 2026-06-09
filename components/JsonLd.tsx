import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from '@/lib/seo'

export function JsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${absoluteUrl('/')}#website`,
        url: absoluteUrl('/'),
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: 'en-US',
      },
      {
        '@type': 'WebApplication',
        '@id': `${absoluteUrl('/')}#app`,
        name: SITE_NAME,
        url: absoluteUrl('/'),
        description: SITE_DESCRIPTION,
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Web, Android, iOS',
        browserRequirements: 'Requires JavaScript',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: [
          'Ad-free YouTube playback',
          'Distraction-free playlists',
          'YouTube Music watch links',
          'Local and cloud playlist sync',
          'Progressive Web App',
        ],
        slogan: SITE_TAGLINE,
      },
      {
        '@type': 'Organization',
        '@id': `${absoluteUrl('/')}#organization`,
        name: SITE_NAME,
        url: absoluteUrl('/'),
        logo: absoluteUrl('/logo512.png'),
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
