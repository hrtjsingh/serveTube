'use client'
import { useState, useEffect } from 'react'
import { Play, ListVideo, CloudUpload, Download, X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STEPS = [
  {
    icon: Play,
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    title: 'Ad-free, distraction-free YouTube',
    desc: 'No ads. No algorithm rabbit holes. Paste a link or play from your playlist — watch only what you choose.',
  },
  {
    icon: ListVideo,
    color: 'text-brand',
    bg: 'bg-brand/10',
    title: 'Your playlists, your queue',
    desc: 'Build playlists with only the videos you pick. No recommendations, no endless scroll — just what you added.',
  },
  {
    icon: Download,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    title: 'Import from YouTube / Music',
    desc: 'Paste a YouTube or YouTube Music playlist link to import tracks. Exports to JSON too.',
  },
  {
    icon: CloudUpload,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    title: 'Sync across devices',
    desc: 'Create a free account to save playlists to the cloud. Guests get local storage automatically.',
  },
]

export function Onboarding() {
  const [visible, setVisible] = useState(false)
  const [step, setStep]       = useState(0)

  useEffect(() => {
    if (!localStorage.getItem('st_onboarded')) setVisible(true)
  }, [])

  const finish = () => {
    localStorage.setItem('st_onboarded', '1')
    setVisible(false)
  }

  if (!visible) return null

  const { icon: Icon, color, bg, title, desc } = STEPS[step]

  return (
    <div className="st-modal-overlay z-[500]">
      <div className="st-modal-panel max-w-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                aria-label={`Go to step ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-6 bg-brand' : 'w-1.5 bg-border hover:bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
          <button onClick={finish} className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <X size={16} />
          </button>
        </div>

        <div className={`mb-5 inline-flex rounded-2xl p-4 ${bg}`}>
          <Icon size={32} className={color} />
        </div>

        <h2 className="mb-2 text-xl font-bold">{title}</h2>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{desc}</p>

        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)}>
              <ChevronLeft size={14} /> Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button variant="brand" onClick={() => setStep(s => s + 1)} className="flex-1">
              Next <ChevronRight size={14} />
            </Button>
          ) : (
            <Button variant="brand" onClick={finish} className="flex-1">
              <Sparkles size={14} /> Get Started
            </Button>
          )}
        </div>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Step {step + 1} of {STEPS.length}
        </p>
      </div>
    </div>
  )
}
