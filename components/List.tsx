'use client';
import React from 'react';
import VideoInfo from './VideoInfo';
import styled from 'styled-components';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import SortableVideoItem from './SortableVideoItem'; 

const List = ({ videoList, changeVideo, deleteVideo, playingVideo, setVideoList ,updateList}: any) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = videoList.findIndex((item: any) => item.id === active.id);
      const newIndex = videoList.findIndex((item: any) => item.id === over?.id);
      const newList = arrayMove(videoList, oldIndex, newIndex);
      setVideoList(newList);
      updateList(newList)
      // localStorage.setItem('videoList', JSON.stringify(newList));
    }
  };

  return (
    <ListContainer>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={videoList.map((v: any) => v.id)} strategy={verticalListSortingStrategy}>
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
    </ListContainer>
  );
};

export default List;

const ListContainer = styled.div`
  max-height: 500px;
  overflow: auto;
  overflow-x: hidden;
`;
