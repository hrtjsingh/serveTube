import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { SlOptionsVertical } from "react-icons/sl";
import useClickOutside from './useClickOutside';
import { FaPlay } from "react-icons/fa";
const VideoInfo = ({ id, index, changeVideo, deleteVideo, playingVideo }) => {
    const [videoInfo, setVideoInfo] = useState(null);
    const [showOptions, setShowOptions] = useState(false);
    const [error, setError] = useState(null);
    const key = process.env.REACT_APP_API_KEY
    const ref = useClickOutside(() => setShowOptions(false));
    const getData = async (e) => {
        try {
            const response = await axios.get(
                `https://www.googleapis.com/youtube/v3/videos?key=${key}&part=snippet&id=${id}`
            );

            setVideoInfo(response.data.items[0].snippet);
            setError(null);
        } catch (err) {
            setError('Video not found or API request failed.');
            setVideoInfo(null);
        }
    };

    useEffect(() => {
        getData()
    }, [id])

    return (
        <div>
            {error && <p>{error}</p>}
            {videoInfo && (
                <VideoInfoMain>
                    <span>{playingVideo ? <FaPlay size="16px" /> : index + 1}</span>
                    <TitleContainer onClick={() => { changeVideo(id) }}>
                        <img src={videoInfo.thumbnails.default.url} alt="Thumbnail" />
                        <h5>{videoInfo.title}</h5>
                    </TitleContainer>
                    <OptionContainer>
                        <SlOptionsVertical size="16px" onClick={() => { setShowOptions(!showOptions) }} />
                        {showOptions && <Options ref={ref}>
                            <OptionList>
                                <span onClick={() => { deleteVideo(id) }}>Remove</span>
                            </OptionList>
                        </Options>}
                    </OptionContainer>
                </VideoInfoMain>
            )}
        </div>
    );
};

export default VideoInfo;


const VideoInfoMain = styled.div`
    display: flex;
    align-items: center;
    margin: 20px;
    max-width: 480px;
    /* border: 1px solid #232323d6; */
    padding: 5px;
    gap: 20px;
    border-radius: 5px;
    cursor: pointer;
    &:hover{
        background-color:#161616 ;
    }
`;

const TitleContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    max-width: 450px;
    cursor: pointer;
    & img{
        margin-right: 20px;
    }
    @media (max-width: 968px) {
        margin: 20px 0;
         & img{
         height:80px;
         width:80px;
        }
        & h5{
        font-size:10px;
        }
    }
    
`;

const OptionContainer = styled.div`
    position: relative;
    user-select: none;
`;

const Options = styled.div`
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 110%;
    right: -85%;
    padding:10px;
    font-weight: 600;
    background-color: aliceblue;
    color: black;
    border-radius: 5px;
    &:hover{
        background-color: #a7b0b8;
    }
`;

const OptionList = styled.div`
    margin: 0;
`
