'use client'
import { useAppTheme, AppTheme } from '@/context/ThemeContext'
import { Sun, Moon, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

const THEMES: { value: AppTheme; label: string; icon: typeof Sun; desc: string }[] = [
  { value: 'light',  label: 'Light',  icon: Sun,    desc: 'Bright white'   },
  { value: 'dark',   label: 'Dark',   icon: Moon,   desc: 'Easy on eyes'   },
  { value: 'amoled', label: 'AMOLED', icon: Circle, desc: 'True black'     },
]

export function ThemeSwitcher() {
  const { theme, setTheme } = useAppTheme()

  return (
    <div className="grid grid-cols-3 gap-2">
      {THEMES.map(({ value, label, icon: Icon, desc }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            'flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition-all',
            theme === value
              ? 'border-brand bg-brand/10 text-brand shadow-sm shadow-brand/10'
              : 'border-border text-muted-foreground hover:border-border/80 hover:bg-muted/40'
          )}
        >
          <Icon size={18} />
          <span>{label}</span>
          <span className="text-[10px] font-normal opacity-70">{desc}</span>
        </button>
      ))}
    </div>
  )
}
