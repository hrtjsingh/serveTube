'use client'

import { useEffect, useState } from 'react'
import { BrandLogo } from './BrandLogo'

export function HomeHero() {
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    setCompact(!!localStorage.getItem('st_onboarded'))
  }, [])

  if (compact) {
    return (
      <header className="mb-5 w-full max-w-2xl text-center">
        <BrandLogo className="mx-auto mb-3 justify-center" size="2xl" />
        <h1 className="st-display text-xl font-semibold tracking-tight sm:text-2xl">
          <span className="st-gradient-text">Ad-free, distraction-free YouTube</span>
        </h1>
        <p className="st-jp mt-1.5 text-xs tracking-[0.2em] text-brand/70">
          侍 · 集中して観る
        </p>
      </header>
    )
  }

  return (
    <header className="mb-8 w-full max-w-2xl text-center sm:mb-10">
      <div className="st-hero-divider mb-5">
        <span className="st-accent-dot" />
      </div>
      <BrandLogo className="mx-auto mb-4 justify-center" size="3xl" />
      <p className="st-jp mb-3 text-sm font-light tracking-[0.3em] text-brand/90 uppercase">
        侍 · 集中して観る
      </p>
      <h1 className="st-display text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
        <span className="st-gradient-text">Ad-free, distraction-free YouTube</span>
      </h1>
      <div className="st-hero-divider mt-5">
        <span className="st-accent-dot" />
      </div>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
        Cut through the noise. Watch with discipline —
        playlists, no ads, no feed.
      </p>
    </header>
  )
}
