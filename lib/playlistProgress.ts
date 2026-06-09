import { readLocalJson, writeLocalJson } from '@/lib/storage'

export const LS_PLAYLIST_PROGRESS = 'servetube_playlist_progress'

export type PlaylistSource = 'local' | 'auth'

export interface SavedPlaylistProgress {
  playlistId: string
  source: PlaylistSource
  videoId: string
  trackIndex: number
  positionSec: number
  updatedAt: number
}

export interface YtPlayerApi {
  getCurrentTime: () => number
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  getPlayerState?: () => number
}

export function readPlaylistProgress(): SavedPlaylistProgress | null {
  return readLocalJson<SavedPlaylistProgress | null>(LS_PLAYLIST_PROGRESS, null)
}

export function writePlaylistProgress(progress: SavedPlaylistProgress): void {
  writeLocalJson(LS_PLAYLIST_PROGRESS, progress)
}

export function clearPlaylistProgress(): void {
  writeLocalJson(LS_PLAYLIST_PROGRESS, null)
}
