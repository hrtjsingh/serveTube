'use client'

import { useEffect } from 'react'

const VIEWPORT_CONTENT =
  'width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=5'

export function PwaViewportFix() {
  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    const meta =
      document.querySelector('meta[name="viewport"]') ??
      (() => {
        const el = document.createElement('meta')
        el.setAttribute('name', 'viewport')
        document.head.appendChild(el)
        return el
      })()

    meta.setAttribute('content', VIEWPORT_CONTENT)

    const syncLayout = () => {
      const useMobileChrome = isStandalone
        ? window.innerWidth < 1024
        : window.innerWidth < 640
      document.documentElement.classList.toggle('pwa-mobile-layout', useMobileChrome)
    }

    syncLayout()
    window.addEventListener('resize', syncLayout)
    return () => window.removeEventListener('resize', syncLayout)
  }, [])

  return null
}
