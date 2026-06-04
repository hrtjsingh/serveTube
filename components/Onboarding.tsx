'use client'
import { useState, useEffect } from 'react'
import { Play, ListVideo, CloudUpload, Download, X, ChevronRight, ChevronLeft } from 'lucide-react'

const STEPS = [
  {
    icon: Play,
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    title: 'Play YouTube & YouTube Music, ad-free',
    desc: 'Paste a YouTube or YouTube Music song link (watch?v=…) or video ID, then hit Play. No ads.',
  },
  {
    icon: ListVideo,
    color: 'text-[#f8bf59]',
    bg: 'bg-[#f8bf59]/10',
    title: 'Build multiple playlists',
    desc: 'Create named playlists, add videos, reorder by dragging, and switch between them instantly.',
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
    <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
        {/* Progress dots */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-6 bg-[#f8bf59]' : 'w-1.5 bg-border'
                }`}
              />
            ))}
          </div>
          <button onClick={finish} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Icon */}
        <div className={`mb-5 inline-flex rounded-2xl p-4 ${bg}`}>
          <Icon size={32} className={color} />
        </div>

        {/* Text */}
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{desc}</p>

        {/* Actions */}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              <ChevronLeft size={14} /> Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#f8bf59] px-4 py-2.5 text-sm font-bold text-[#070707] hover:bg-[#ffe49f] transition-colors"
            >
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={finish}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#f8bf59] px-4 py-2.5 text-sm font-bold text-[#070707] hover:bg-[#ffe49f] transition-colors"
            >
              Get Started 🎉
            </button>
          )}
        </div>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Step {step + 1} of {STEPS.length}
        </p>
      </div>
    </div>
  )
}
