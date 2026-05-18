'use client'
import { useAppTheme, AppTheme } from '@/context/ThemeContext'
import { Sun, Moon, Circle } from 'lucide-react'

const THEMES: { value: AppTheme; label: string; icon: typeof Sun; desc: string }[] = [
  { value: 'light',  label: 'Light',  icon: Sun,    desc: 'Bright white'   },
  { value: 'dark',   label: 'Dark',   icon: Moon,   desc: 'Easy on eyes'   },
  { value: 'amoled', label: 'AMOLED', icon: Circle, desc: 'True black'     },
]

export function ThemeSwitcher() {
  const { theme, setTheme } = useAppTheme()

  return (
    <div className="flex gap-2">
      {THEMES.map(({ value, label, icon: Icon, desc }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition-all ${
            theme === value
              ? 'border-[#f8bf59] bg-[#f8bf59]/10 text-[#f8bf59]'
              : 'border-border text-muted-foreground hover:border-border/80 hover:bg-muted/40'
          }`}
        >
          <Icon size={18} />
          <span>{label}</span>
          <span className="text-[10px] font-normal opacity-70">{desc}</span>
        </button>
      ))}
    </div>
  )
}
