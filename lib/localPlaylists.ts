import { readLocalJson, writeLocalJson } from '@/lib/storage'
import { readPlaylistProgress } from '@/lib/playlistProgress'

export const LS_PLAYLIST_LEGACY = 'servetube_local_playlist'
export const LS_PLAYLISTS = 'servetube_local_playlists'

export const DEFAULT_VIDEO_ID = '36AKk9A5gH8'

export interface LocalPlaylist {
  _id: string
  name: string
  description: string
  coverColor: string
  songs: { id: string }[]
  isDefault: boolean
}

export const DEFAULT_LOCAL_PLAYLIST: LocalPlaylist = {
  _id: 'local-default',
  name: 'My Playlist',
  description: '',
  coverColor: '#f8bf59',
  songs: [],
  isDefault: true,
}

function isValidSong(item: unknown): item is { id: string } {
  return (
    !!item &&
    typeof item === 'object' &&
    typeof (item as { id?: string }).id === 'string' &&
    (item as { id: string }).id.length === 11
  )
}

function normalizePlaylists(raw: LocalPlaylist[]): LocalPlaylist[] {
  if (!raw.length) return [{ ...DEFAULT_LOCAL_PLAYLIST }]
  return raw.map(p => ({
    ...p,
    songs: Array.isArray(p.songs) ? p.songs.filter(isValidSong) : [],
  }))
}

/** Load guest playlists from localStorage, merging legacy single-playlist storage. */
export function loadLocalPlaylistsFromStorage(): {
  playlists: LocalPlaylist[]
  activeId: string
} {
  let playlists = normalizePlaylists(readLocalJson<LocalPlaylist[]>(LS_PLAYLISTS, []))

  const legacy = readLocalJson<unknown[]>(LS_PLAYLIST_LEGACY, []).filter(isValidSong)
  if (legacy.length) {
    const defaultIdx = playlists.findIndex(p => p.isDefault)
    const idx = defaultIdx >= 0 ? defaultIdx : 0
    const existing = new Set(playlists[idx].songs.map(s => s.id))
    const merged = [...playlists[idx].songs]
    for (const song of legacy) {
      if (!existing.has(song.id)) merged.push(song)
    }
    playlists = playlists.map((p, i) => (i === idx ? { ...p, songs: merged } : p))
    writeLocalJson(LS_PLAYLISTS, playlists)
    writeLocalJson(LS_PLAYLIST_LEGACY, [])
  }

  const hasAnySongs = playlists.some(p => p.songs.length > 0)
  if (!hasAnySongs) {
    const defaultIdx = playlists.findIndex(p => p.isDefault)
    const idx = defaultIdx >= 0 ? defaultIdx : 0
    playlists = playlists.map((p, i) =>
      i === idx ? { ...p, songs: [{ id: DEFAULT_VIDEO_ID }] } : p
    )
    writeLocalJson(LS_PLAYLISTS, playlists)
  }

  const progress = readPlaylistProgress()
  let activeId = playlists[0]?._id || DEFAULT_LOCAL_PLAYLIST._id
  if (progress?.source === 'local') {
    const match = playlists.find(p => p._id === progress.playlistId)
    if (match) activeId = match._id
  }

  return { playlists, activeId }
}
