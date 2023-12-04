import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const VideoInfo = ({ id, onClick }) => {
    const [videoInfo, setVideoInfo] = useState(null);
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
        <div onClick={onClick}>
            {error && <p>{error}</p>}

            {videoInfo && (
                <VideoInfoMain>
                    <img src={videoInfo.thumbnails.default.url} alt="Thumbnail" />
                    <h5>{videoInfo.title}</h5>
                </VideoInfoMain>
            )}
        </div>
    );
};

export default VideoInfo;


const VideoInfoMain = styled.div`
    display: flex;
    margin: 20px;
    max-width: 450px;
    cursor: pointer;
    & img{
        margin-right: 20px;
    }
`