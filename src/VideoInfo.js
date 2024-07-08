import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { SlOptionsVertical } from "react-icons/sl";

const VideoInfo = ({ id, changeVideo, deleteVideo }) => {
    const [videoInfo, setVideoInfo] = useState(null);
    const [showOptions, setShowOptions] = useState(false);
    const [error, setError] = useState(null);
    const key = process.env.REACT_APP_API_KEY

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
                    <TitleContainer onClick={() => { changeVideo(id) }}>
                        <img src={videoInfo.thumbnails.default.url} alt="Thumbnail" />
                        <h5>{videoInfo.title}</h5>
                    </TitleContainer>
                    <OptionContainer>
                        <SlOptionsVertical size="23px" onClick={() => { setShowOptions(!showOptions) }} />
                        {showOptions && <Options>
                            <OptionList>
                                <span onClick={() => { deleteVideo(id) }}>Delete</span>
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
    cursor: pointer;
`;

const TitleContainer = styled.div`
    display: flex;
    margin: 20px;
    max-width: 450px;
    cursor: pointer;
    & img{
        margin-right: 20px;
    }
    @media (max-width: 968px) {
        margin: 20px 0;
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
`;

const OptionList = styled.div`
    margin: 0;
`