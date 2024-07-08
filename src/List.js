import React from 'react'
import VideoInfo from './VideoInfo'
import styled from 'styled-components'

const List = ({ videoList, changeVideo, deleteVideo, playingVideo }) => {
    return (
        <ListContainer>
            {videoList.length > 0 && videoList.map((item, index) => (
                <VideoInfo key={item.id} changeVideo={changeVideo} index={index} id={item.id} deleteVideo={deleteVideo} playingVideo={item.id === playingVideo} />
            ))}
        </ListContainer>
    )
}

export default List

const ListContainer = styled.div`
    max-height: 500px;
    overflow: auto;
    scrollbar-gutter: stable;
    &::-webkit-scrollbar {
        width: 2px;
        display: none;
    }
    &::-webkit-scrollbar-thumb {
        background-color: #FFFFFF;
        border-radius: 5px;
    }
    &::-webkit-scrollbar-track {
        background-color: #2D2951;
    }
`;