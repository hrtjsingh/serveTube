type OrientationWithLock = ScreenOrientation & {
  lock?: (orientation: 'landscape' | 'portrait' | 'natural') => Promise<void>
  unlock?: () => void
}

export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 1023px)').matches
}

export function isFullscreenActive(el: HTMLElement | null): boolean {
  if (!el) return false
  return document.fullscreenElement === el
}

export async function lockLandscape(): Promise<void> {
  try {
    const orientation = screen.orientation as OrientationWithLock | undefined
    await orientation?.lock?.('landscape')
  } catch {
    // Not supported (e.g. iOS) or requires user gesture
  }
}

export function unlockLandscape(): void {
  try {
    const orientation = screen.orientation as OrientationWithLock | undefined
    orientation?.unlock?.()
  } catch {
    // ignore
  }
}

export async function enterPlayerFullscreen(el: HTMLElement): Promise<void> {
  if (el.requestFullscreen) {
    await el.requestFullscreen()
  } else {
    const legacy = el as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void
    }
    await legacy.webkitRequestFullscreen?.()
  }
  await lockLandscape()
}

export async function exitPlayerFullscreen(): Promise<void> {
  unlockLandscape()
  if (document.fullscreenElement) {
    if (document.exitFullscreen) {
      await document.exitFullscreen()
    } else {
      const legacy = document as Document & {
        webkitExitFullscreen?: () => Promise<void> | void
      }
      await legacy.webkitExitFullscreen?.()
    }
  }
}
