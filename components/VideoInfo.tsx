'use client'
import React, { useEffect, useState } from 'react';
import { Play, Trash2, GripVertical, Loader2 } from 'lucide-react';
import { fetchYouTubeTitle } from '@/lib/youtubeMetadata';
import { cn } from '@/lib/utils';

const VideoInfo = ({ id, index, changeVideo, deleteVideo, playingVideo, dragHandleProps }: {
  id: string
  index: number
  changeVideo: (id: string) => void
  deleteVideo: (id: string) => void
  playingVideo: boolean
  dragHandleProps?: Record<string, unknown>
}) => {
  const [thumb, setThumb] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setThumb(`https://i.ytimg.com/vi/${id}/mqdefault.jpg`);
    fetchYouTubeTitle(id)
      .then(t => setTitle(t))
      .catch(() => setTitle(id))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div
      className={cn(
        'group flex cursor-pointer items-center gap-2 rounded-lg border p-2 transition-all',
        playingVideo
          ? 'border-brand/30 bg-brand/10 shadow-sm shadow-brand/5'
          : 'border-transparent hover:bg-muted/50'
      )}
      role="button"
      aria-label={playingVideo ? `Now playing: ${title || id}` : `Play ${title || id}`}
    >
      <span {...dragHandleProps} className="cursor-grab touch-none p-1 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground">
        <GripVertical size={14} />
      </span>

      <span className="flex w-5 shrink-0 items-center justify-center text-xs text-muted-foreground">
        {playingVideo
          ? <Play size={11} className="fill-brand text-brand" />
          : <span className="font-mono">{index + 1}</span>
        }
      </span>

      <div
        className="relative shrink-0 overflow-hidden rounded-md bg-muted"
        style={{ width: 72, height: 40 }}
        onClick={() => changeVideo(id)}
      >
        {loading ? (
          <div className="absolute inset-0 flex animate-pulse items-center justify-center bg-muted">
            <Loader2 size={14} className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <img src={thumb} alt={title} className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <Play size={14} className="fill-white text-white" />
        </div>
      </div>

      <div className="min-w-0 flex-1 cursor-pointer" onClick={() => changeVideo(id)}>
        <p className="truncate text-xs font-medium leading-snug">
          {loading ? <span className="text-muted-foreground">Loading…</span> : title}
        </p>
        <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/60">{id}</p>
      </div>

      <button
        onClick={e => { e.stopPropagation(); deleteVideo(id); }}
        className="shrink-0 rounded p-1.5 text-muted-foreground/40 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
        title="Remove"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
};

export default VideoInfo;
