'use client';
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import VideoInfo from './VideoInfo';

const SortableVideoItem = ({ id, index, changeVideo, deleteVideo, playingVideo }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <VideoInfo
        id={id}
        index={index}
        changeVideo={changeVideo}
        deleteVideo={deleteVideo}
        playingVideo={playingVideo}
      />
    </div>
  );
};

export default SortableVideoItem;
