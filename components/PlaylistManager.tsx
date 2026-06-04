'use client'
import React, { useState, useCallback } from 'react'
import {
  Plus, Trash2, Edit3, Download, Upload, Copy,
  Check, X, Loader2, Music, ChevronRight, Palette,
  Link2, FileDown, ListVideo
} from 'lucide-react'
import axios from 'axios'

export interface PlaylistDoc {
  _id: string
  name: string
  description: string
  coverColor: string
  songs: { id: string }[]
  isDefault: boolean
}

interface Props {
  userId: string
  playlists: PlaylistDoc[]
  activeId: string | null
  onSelect: (id: string) => void
  onCreated: (p: PlaylistDoc) => void
  onUpdated: (p: PlaylistDoc) => void
  onDeleted: (id: string) => void
  showToast: (msg: string, type?: string) => void
}

const COVER_COLORS = [
  '#f8bf59','#ef4444','#8b5cf6','#3b82f6',
  '#10b981','#f97316','#ec4899','#06b6d4',
]

// ── Create playlist modal ──────────────────────────────────────────────────
function CreateModal({
  userId, onCreated, onClose, showToast
}: { userId: string; onCreated: (p: PlaylistDoc) => void; onClose: () => void; showToast: (m: string, t?: string) => void }) {
  const [name, setName]         = useState('')
  const [desc, setDesc]         = useState('')
  const [color, setColor]       = useState('#f8bf59')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const submit = async () => {
    if (!name.trim()) { setError('Name is required'); return }
    setLoading(true)
    try {
      const res = await axios.post('/api/playlists/add', {
        userId, name: name.trim(), description: desc.trim(), coverColor: color, songs: []
      })
      onCreated(res.data.playlist)
      showToast(`Playlist "${name}" created ✓`, 'success')
      onClose()
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to create')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="New Playlist" onClose={onClose}>
      <div className="space-y-4">
        <Field label="Name">
          <input className={INPUT} placeholder="My Awesome Playlist" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
        </Field>
        <Field label="Description (optional)">
          <input className={INPUT} placeholder="What's this playlist about?" value={desc} onChange={e => setDesc(e.target.value)} />
        </Field>
        <Field label="Cover color">
          <div className="flex gap-2 flex-wrap">
            {COVER_COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className={`h-7 w-7 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                style={{ background: c }} />
            ))}
          </div>
        </Field>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onClose} className={BTN_GHOST}>Cancel</button>
          <button onClick={submit} disabled={loading} className={BTN_PRIMARY}>
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Create
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Edit playlist modal ────────────────────────────────────────────────────
function EditModal({
  playlist, onUpdated, onClose, showToast
}: { playlist: PlaylistDoc; onUpdated: (p: PlaylistDoc) => void; onClose: () => void; showToast: (m: string, t?: string) => void }) {
  const [name, setName]   = useState(playlist.name)
  const [desc, setDesc]   = useState(playlist.description)
  const [color, setColor] = useState(playlist.coverColor)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!name.trim()) { setError('Name is required'); return }
    setLoading(true)
    try {
      const res = await axios.patch(`/api/playlists/${playlist._id}/rename`, {
        name: name.trim(), description: desc.trim(), coverColor: color
      })
      onUpdated(res.data.playlist)
      showToast('Playlist updated ✓', 'success')
      onClose()
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to update')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Edit Playlist" onClose={onClose}>
      <div className="space-y-4">
        <Field label="Name"><input className={INPUT} value={name} onChange={e => setName(e.target.value)} /></Field>
        <Field label="Description"><input className={INPUT} value={desc} onChange={e => setDesc(e.target.value)} /></Field>
        <Field label="Cover color">
          <div className="flex gap-2 flex-wrap">
            {COVER_COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className={`h-7 w-7 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                style={{ background: c }} />
            ))}
          </div>
        </Field>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onClose} className={BTN_GHOST}>Cancel</button>
          <button onClick={submit} disabled={loading} className={BTN_PRIMARY}>
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Save
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Import from YouTube modal ──────────────────────────────────────────────
function ImportModal({
  userId, onCreated, onClose, showToast
}: { userId: string; onCreated: (p: PlaylistDoc) => void; onClose: () => void; showToast: (m: string, t?: string) => void }) {
  const [url, setUrl]         = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [preview, setPreview] = useState<{ name: string; songs: { id: string }[]; description: string } | null>(null)

  const fetchPlaylist = async () => {
    if (!url.trim()) { setError('Paste a YouTube playlist URL'); return }
    setError(''); setLoading(true); setPreview(null)
    try {
      const res = await axios.post('/api/playlists/import-youtube', { url })
      setPreview(res.data)
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'Failed to import'
      const needsKey = e?.response?.data?.needsApiKey
      setError(needsKey ? 'Add YOUTUBE_API_KEY to .env.local to enable import.' : msg)
    } finally {
      setLoading(false)
    }
  }

  const savePlaylist = async () => {
    if (!preview) return
    setLoading(true)
    try {
      const res = await axios.post('/api/playlists/add', {
        userId, name: preview.name, description: preview.description,
        coverColor: '#ef4444', songs: preview.songs
      })
      onCreated(res.data.playlist)
      showToast(`Imported "${preview.name}" (${preview.songs.length} videos) ✓`, 'success')
      onClose()
    } catch {
      setError('Failed to save playlist')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Import playlist" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Paste a YouTube or YouTube Music playlist URL (youtube.com or music.youtube.com, list=…)
        </p>
        <div className="flex gap-2">
          <input
            className={`${INPUT} flex-1`}
            placeholder="https://music.youtube.com/playlist?list=…"
            value={url}
            onChange={e => { setUrl(e.target.value); setError(''); setPreview(null) }}
            onKeyDown={e => e.key === 'Enter' && fetchPlaylist()}
          />
          <button onClick={fetchPlaylist} disabled={loading || !url.trim()} className={BTN_PRIMARY}>
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Link2 size={13} />}
          </button>
        </div>

        {error && <p className="text-xs text-red-400 bg-red-400/10 p-2 rounded-lg">{error}</p>}

        {preview && (
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-red-500/20 flex items-center justify-center">
                <ListVideo size={18} className="text-red-400" />
              </div>
              <div>
                <p className="text-sm font-bold">{preview.name}</p>
                <p className="text-xs text-muted-foreground">{preview.songs.length} videos found</p>
              </div>
            </div>
            {preview.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{preview.description}</p>
            )}
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className={BTN_GHOST}>Cancel</button>
          {preview ? (
            <button onClick={savePlaylist} disabled={loading} className={BTN_PRIMARY}>
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              Save Playlist
            </button>
          ) : (
            <button onClick={fetchPlaylist} disabled={loading || !url.trim()} className={BTN_PRIMARY}>
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Link2 size={13} />}
              Fetch
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}

// ── Export modal ────────────────────────────────────────────────────────────
function ExportModal({ playlist, onClose }: { playlist: PlaylistDoc; onClose: () => void }) {
  const [copied, setCopied] = useState(false)

  const jsonStr = JSON.stringify({
    name: playlist.name,
    description: playlist.description,
    videos: playlist.songs.map(s => ({
      id: s.id,
      url: `https://youtube.com/watch?v=${s.id}`,
    })),
    exportedAt: new Date().toISOString(),
  }, null, 2)

  const download = () => {
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const a    = document.createElement('a')
    a.href     = URL.createObjectURL(blob)
    a.download = `${playlist.name.replace(/\s+/g, '_')}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const copy = () => {
    const urls = playlist.songs.map(s => `https://youtube.com/watch?v=${s.id}`).join('\n')
    navigator.clipboard.writeText(urls)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal title={`Export "${playlist.name}"`} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">{playlist.songs.length} videos</p>
        <pre className="rounded-lg bg-muted/40 border border-border p-3 text-[11px] font-mono overflow-auto max-h-40 text-muted-foreground">
          {jsonStr.slice(0, 400)}{jsonStr.length > 400 ? '\n…' : ''}
        </pre>
        <div className="flex gap-2">
          <button onClick={copy} className={`${BTN_GHOST} flex-1`}>
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            {copied ? 'Copied!' : 'Copy URLs'}
          </button>
          <button onClick={download} className={`${BTN_PRIMARY} flex-1`}>
            <FileDown size={13} /> Download JSON
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Main PlaylistManager ────────────────────────────────────────────────────
export function PlaylistManager({
  userId, playlists, activeId, onSelect, onCreated, onUpdated, onDeleted, showToast
}: Props) {
  const [modal, setModal] = useState<'create' | 'edit' | 'import' | 'export' | null>(null)
  const [editTarget, setEditTarget]     = useState<PlaylistDoc | null>(null)
  const [exportTarget, setExportTarget] = useState<PlaylistDoc | null>(null)
  const [deleting, setDeleting]         = useState<string | null>(null)

  const deletePlaylist = useCallback(async (p: PlaylistDoc) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return
    setDeleting(p._id)
    try {
      await axios.delete(`/api/playlists/${p._id}/delete`)
      onDeleted(p._id)
      showToast(`"${p.name}" deleted`, 'info')
    } catch {
      showToast('Failed to delete playlist', 'error')
    } finally {
      setDeleting(null)
    }
  }, [onDeleted, showToast])

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Music size={15} className="text-[#f8bf59]" />
          <span className="text-sm font-bold">Playlists</span>
          <span className="rounded-full bg-[#f8bf59]/20 text-[#f8bf59] text-xs font-bold px-2 py-0.5">
            {playlists.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setModal('import')} title="Import from YouTube"
            className="flex items-center gap-1 rounded-md border border-border px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Upload size={12} /> Import
          </button>
          <button onClick={() => setModal('create')}
            className="flex items-center gap-1 rounded-md bg-[#f8bf59] px-2 py-1.5 text-xs font-bold text-[#070707] hover:bg-[#ffe49f] transition-colors">
            <Plus size={12} /> New
          </button>
        </div>
      </div>

      {/* Playlist list */}
      {playlists.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
          <ListVideo size={28} className="opacity-30" />
          <p className="text-sm">No playlists yet</p>
          <button onClick={() => setModal('create')} className={BTN_PRIMARY}>
            <Plus size={13} /> Create first playlist
          </button>
        </div>
      ) : (
        <div className="space-y-1.5">
          {playlists.map(p => {
            const active = p._id === activeId
            return (
              <div
                key={p._id}
                onClick={() => onSelect(p._id)}
                className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 cursor-pointer transition-all ${
                  active
                    ? 'border-[#f8bf59]/40 bg-[#f8bf59]/10'
                    : 'border-border hover:border-border/80 hover:bg-muted/30'
                }`}
              >
                {/* Color swatch */}
                <div
                  className="h-8 w-8 flex-shrink-0 rounded-lg flex items-center justify-center text-white"
                  style={{ background: p.coverColor }}
                >
                  <ListVideo size={14} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {p.songs.length} video{p.songs.length !== 1 ? 's' : ''}
                    {p.description ? ` · ${p.description.slice(0, 30)}${p.description.length > 30 ? '…' : ''}` : ''}
                  </p>
                </div>

                {/* Active chevron */}
                {active && <ChevronRight size={14} className="text-[#f8bf59] flex-shrink-0" />}

                {/* Actions — show on hover */}
                <div className="hidden group-hover:flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => { setExportTarget(p); setModal('export') }}
                    title="Export" className="rounded p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <FileDown size={13} />
                  </button>
                  <button
                    onClick={() => { setEditTarget(p); setModal('edit') }}
                    title="Edit" className="rounded p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <Edit3 size={13} />
                  </button>
                  <button
                    onClick={() => deletePlaylist(p)}
                    title="Delete" className="rounded p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors">
                    {deleting === p._id
                      ? <Loader2 size={13} className="animate-spin" />
                      : <Trash2 size={13} />
                    }
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      {modal === 'create' && (
        <CreateModal userId={userId} onCreated={onCreated} onClose={() => setModal(null)} showToast={showToast} />
      )}
      {modal === 'edit' && editTarget && (
        <EditModal playlist={editTarget} onUpdated={onUpdated} onClose={() => { setModal(null); setEditTarget(null) }} showToast={showToast} />
      )}
      {modal === 'import' && (
        <ImportModal userId={userId} onCreated={onCreated} onClose={() => setModal(null)} showToast={showToast} />
      )}
      {modal === 'export' && exportTarget && (
        <ExportModal playlist={exportTarget} onClose={() => { setModal(null); setExportTarget(null) }} />
      )}
    </>
  )
}

// ── Shared sub-components ────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

const INPUT    = 'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-[#f8bf59] transition-colors placeholder:text-muted-foreground'
const BTN_PRIMARY = 'flex items-center gap-1.5 rounded-lg bg-[#f8bf59] px-3 py-2 text-xs font-bold text-[#070707] hover:bg-[#ffe49f] transition-colors disabled:opacity-50'
const BTN_GHOST   = 'flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors'
