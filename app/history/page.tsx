'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePlayer } from '@/context/PlayerContext'
import { Play, Trash2, History, Clock } from 'lucide-react'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'

import { readLocalJson, writeLocalJson } from '@/lib/storage'

const LS_HIST = 'servetube_watch_history'

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60)  return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function HistoryPage() {
  const router = useRouter()
  const { setVideoId } = usePlayer()
  const [history, setHistory] = useState<{ id: string; watchedAt: number }[]>([])
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const playVideo = (id: string) => setVideoId(id)

  useEffect(() => { setHistory(readLocalJson(LS_HIST, [])) }, [])

  const clear = () => { setHistory([]); writeLocalJson(LS_HIST, []) }
  const remove = (id: string, ts: number) => {
    const updated = history.filter(x => !(x.id === id && x.watchedAt === ts))
    setHistory(updated); writeLocalJson(LS_HIST, updated)
  }

  return (
    <div className="st-page-narrow">
      <PageHeader
        title="Watch History"
        subtitle={`${history.length} videos watched`}
        icon={History}
        action={history.length > 0 ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowClearConfirm(true)}
            className="text-muted-foreground hover:border-destructive/40 hover:text-destructive"
          >
            <Trash2 size={13} /> Clear all
          </Button>
        ) : undefined}
      />

      {history.length === 0 ? (
        <EmptyState
          icon={History}
          title="No watch history"
          description="Videos you play will appear here."
          action={{ label: 'Browse videos', onClick: () => router.push('/'), icon: Play }}
        />
      ) : (
        <div className="space-y-2">
          {history.map(h => (
            <div key={h.id + h.watchedAt} className="st-list-row group">
              <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                <img
                  src={`https://i.ytimg.com/vi/${h.id}/mqdefault.jpg`}
                  alt={h.id}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Play size={14} className="fill-white text-white" />
                </div>
              </div>
              <div className="min-w-0 flex-1 cursor-pointer" onClick={() => playVideo(h.id)}>
                <p className="truncate text-sm font-medium">{h.id}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground" suppressHydrationWarning>
                  <Clock size={10} /> {timeAgo(h.watchedAt)}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="brandSoft" size="sm" onClick={() => playVideo(h.id)}>
                  <Play size={11} /> Play
                </Button>
                <button
                  onClick={() => remove(h.id, h.watchedAt)}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={showClearConfirm}
        title="Clear watch history?"
        message="Remove all watched videos from your history? This cannot be undone."
        confirmText="Clear all"
        variant="danger"
        onConfirm={() => {
          clear()
          setShowClearConfirm(false)
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  )
}
