'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'

export type AppTheme = 'dark' | 'light' | 'amoled'

interface ThemeCtx {
  theme: AppTheme
  setTheme: (t: AppTheme) => void
}

const ThemeContext = createContext<ThemeCtx>({ theme: 'dark', setTheme: () => {} })

const AMOLED_VARS = `
  --background: oklch(0 0 0);
  --card: oklch(0.06 0 0);
  --popover: oklch(0.06 0 0);
  --muted: oklch(0.1 0 0);
  --border: oklch(1 0 0 / 8%);
  --input: oklch(1 0 0 / 10%);
`

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('st_theme') as AppTheme | null
    if (saved) applyTheme(saved)
  }, [])

  const applyTheme = (t: AppTheme) => {
    const root = document.documentElement
    // Remove all theme classes
    root.classList.remove('dark', 'light', 'amoled')

    if (t === 'light') {
      root.classList.add('light')
      root.style.cssText = ''
    } else if (t === 'amoled') {
      root.classList.add('dark', 'amoled')
      root.style.cssText = AMOLED_VARS
    } else {
      root.classList.add('dark')
      root.style.cssText = ''
    }
    setThemeState(t)
    localStorage.setItem('st_theme', t)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: applyTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useAppTheme = () => useContext(ThemeContext)
