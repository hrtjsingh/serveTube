'use client';
import React from 'react';
import VideoInfo from './VideoInfo';
import SortableVideoItem from './SortableVideoItem';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

const List = ({ videoList, changeVideo, deleteVideo, playingVideo, setVideoList, updateList }: any) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = videoList.findIndex((v: any) => v.id === active.id);
      const newIndex = videoList.findIndex((v: any) => v.id === over?.id);
      const newList = arrayMove(videoList, oldIndex, newIndex);
      setVideoList(newList);
      updateList(newList);
    }
  };

  return (
    <div className="max-h-[520px] overflow-y-auto overflow-x-hidden p-2 space-y-1">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={videoList.map((v: any) => v.id)}
          strategy={verticalListSortingStrategy}
        >
          {videoList.map((item: any, index: number) => (
            <SortableVideoItem
              key={item.id}
              id={item.id}
              index={index}
              changeVideo={changeVideo}
              deleteVideo={deleteVideo}
              playingVideo={item.id === playingVideo}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default List;
