'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePlayer } from '@/context/PlayerContext'
import { Play, Trash2, History, Clock } from 'lucide-react'

const LS_HIST = 'servetube_watch_history'
const lsGet = (k: string, fb: any = null) => { try { return JSON.parse(localStorage.getItem(k) as string) ?? fb } catch { return fb } }
const lsSet = (k: string, v: any) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

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

  const playVideo = (id: string) => setVideoId(id)

  useEffect(() => { setHistory(lsGet(LS_HIST, [])) }, [])

  const clear = () => { setHistory([]); lsSet(LS_HIST, []) }
  const remove = (id: string, ts: number) => {
    const updated = history.filter(x => !(x.id === id && x.watchedAt === ts))
    setHistory(updated); lsSet(LS_HIST, updated)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 sm:pb-10 space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <History size={22} /> Watch History
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{history.length} videos watched</p>
        </div>
        {history.length > 0 && (
          <button onClick={clear}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors">
            <Trash2 size={13} /> Clear all
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
          <History size={40} className="opacity-20" />
          <h2 className="text-lg font-bold text-foreground">No watch history</h2>
          <p className="text-sm">Videos you play will appear here.</p>
          <button onClick={() => router.push('/')}
            className="mt-2 flex items-center gap-2 rounded-lg bg-[#f8bf59] px-4 py-2 text-sm font-bold text-[#070707] hover:bg-[#ffe49f] transition-colors">
            <Play size={14} /> Browse videos
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map(h => (
            <div key={h.id + h.watchedAt}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:border-border/80 hover:bg-muted/20 transition-all">
              {/* Thumbnail */}
              <div className="relative flex-shrink-0 w-24 aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={`https://i.ytimg.com/vi/${h.id}/mqdefault.jpg`}
                  alt={h.id}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play size={14} className="text-white fill-white" />
                </div>
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => playVideo(h.id)}>
                <p className="text-sm font-mono font-medium truncate">{h.id}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock size={10} /> {timeAgo(h.watchedAt)}
                </p>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => playVideo(h.id)}
                  className="flex items-center gap-1 rounded-md bg-[#f8bf59]/10 text-[#f8bf59] border border-[#f8bf59]/30 px-2.5 py-1.5 text-xs font-bold hover:bg-[#f8bf59]/20 transition-colors">
                  <Play size={11} /> Play
                </button>
                <button
                  onClick={() => remove(h.id, h.watchedAt)}
                  className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
