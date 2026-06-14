'use client'

import { useEffect, useState } from 'react'
import { usePlayer } from '@/context/PlayerContext'
import { fetchYouTubeTitle } from '@/lib/youtubeMetadata'
import { Play, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
    <div className="st-modal-overlay z-[200]">
      <div
        className="st-modal-panel"
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

        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-muted/40">
          <div className="flex gap-3 p-4">
            <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-muted">
              <img
                src={`https://i.ytimg.com/vi/${resumePrompt.videoId}/mqdefault.jpg`}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {trackTotal > 1 ? `Track ${trackNum} of ${trackTotal}` : 'Last played'}
              </p>
              <p className="mt-1 line-clamp-2 text-sm font-medium">
                {titleLoading ? 'Loading title…' : title || resumePrompt.videoId}
              </p>
              {hasPosition && (
                <p className="mt-1 text-xs text-brand">
                  Resume at {formatTime(resumePrompt.positionSec)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button variant="brand" onClick={confirmResumePlayback} className="flex-1">
            <Play size={16} />
            Continue from last watch
          </Button>
          <Button variant="outline" onClick={startPlaylistFromBeginning} className="flex-1">
            <RotateCcw size={16} />
            Start from beginning
          </Button>
        </div>
      </div>
    </div>
  )
}
