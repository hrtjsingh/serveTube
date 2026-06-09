'use client'

import { useEffect, useState } from 'react'
import { usePlayer } from '@/context/PlayerContext'
import { fetchYouTubeTitle } from '@/lib/youtubeMetadata'
import { Play, RotateCcw } from 'lucide-react'

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function ResumePlaybackPrompt() {
  const {
    resumePrompt,
    confirmResumePlayback,
    startPlaylistFromBeginning,
    queue,
  } = usePlayer()

  const [title, setTitle] = useState('')
  const [titleLoading, setTitleLoading] = useState(false)

  useEffect(() => {
    if (!resumePrompt) {
      setTitle('')
      setTitleLoading(false)
      return
    }

    let cancelled = false
    setTitleLoading(true)
    fetchYouTubeTitle(resumePrompt.videoId).then(fetched => {
      if (cancelled) return
      setTitle(fetched)
      setTitleLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [resumePrompt])

  if (!resumePrompt) return null

  const trackNum = resumePrompt.trackIndex + 1
  const trackTotal = queue.length
  const hasPosition = resumePrompt.positionSec > 0

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-labelledby="resume-playback-title"
        aria-modal="true"
      >
        <h2 id="resume-playback-title" className="text-xl font-extrabold tracking-tight">
          Continue watching?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You have saved progress on this playlist.
        </p>

        <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {trackTotal > 1 ? `Track ${trackNum} of ${trackTotal}` : 'Last played'}
          </p>
          <p className="mt-1 text-sm font-medium line-clamp-2">
            {titleLoading ? 'Loading title…' : title || resumePrompt.videoId}
          </p>
          {hasPosition && (
            <p className="mt-1 text-xs text-muted-foreground">
              Resume at {formatTime(resumePrompt.positionSec)}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={confirmResumePlayback}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#f8bf59] px-4 py-2.5 text-sm font-semibold text-black hover:bg-[#f8bf59]/90 transition-colors"
          >
            <Play size={16} />
            Continue from last watch
          </button>
          <button
            type="button"
            onClick={startPlaylistFromBeginning}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold hover:bg-muted transition-colors"
          >
            <RotateCcw size={16} />
            Start from beginning
          </button>
        </div>
      </div>
    </div>
  )
}
