'use client'
import React, { useEffect, useState } from 'react';
import { Play, Trash2, GripVertical, Loader2 } from 'lucide-react';

const VideoInfo = ({ id, index, changeVideo, deleteVideo, playingVideo, dragHandleProps }: any) => {
  const [thumb, setThumb] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Use YouTube oEmbed — no API key needed!
    fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`)
      .then(r => r.json())
      .then(d => {
        setTitle(d.title || id);
        setThumb(`https://i.ytimg.com/vi/${id}/mqdefault.jpg`);
      })
      .catch(() => {
        setTitle(id);
        setThumb(`https://i.ytimg.com/vi/${id}/mqdefault.jpg`);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className={`group flex items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer ${
      playingVideo ? 'bg-[#f8bf59]/10 border border-[#f8bf59]/30' : 'hover:bg-muted/50 border border-transparent'
    }`}>
      {/* Drag handle */}
      <span {...dragHandleProps} className="cursor-grab text-muted-foreground/40 group-hover:text-muted-foreground p-1 transition-colors touch-none">
        <GripVertical size={14} />
      </span>

      {/* Index / playing indicator */}
      <span className="w-5 flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
        {playingVideo
          ? <Play size={11} className="text-[#f8bf59] fill-[#f8bf59]" />
          : <span className="font-mono">{index + 1}</span>
        }
      </span>

      {/* Thumbnail */}
      <div
        className="relative flex-shrink-0 rounded overflow-hidden bg-muted"
        style={{ width: 72, height: 40 }}
        onClick={() => changeVideo(id)}
      >
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={14} className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <img src={thumb} alt={title} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
          <Play size={14} className="text-white fill-white" />
        </div>
      </div>

      {/* Title */}
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => changeVideo(id)}
      >
        <p className="truncate text-xs font-medium leading-snug">
          {loading ? <span className="text-muted-foreground">Loading…</span> : title}
        </p>
        <p className="font-mono text-[10px] text-muted-foreground/60 mt-0.5">{id}</p>
      </div>

      {/* Delete */}
      <button
        onClick={e => { e.stopPropagation(); deleteVideo(id); }}
        className="flex-shrink-0 rounded p-1.5 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
        title="Remove"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
};

export default VideoInfo;
