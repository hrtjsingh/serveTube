import React, { useEffect, useState } from 'react';
import YouTube from 'react-youtube';
import List from './List';
import styled from 'styled-components';

const VideoPlayer = () => {
    const [videoId, setVideoId] = useState('8YB-zGeNfD4');
    const [videoURL, setVideoURL] = useState('');
    const [videoList, setVideoList] = useState([]);
    const originalWidth = 640;
    const originalHeight = 390;
    const newWidth = 800;
    const newHeight = Math.round((newWidth / originalWidth) * originalHeight);
    const handleChange = (e) => {
        setVideoURL(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const videoIdFromLink = extractVideoId(videoURL);
        console.log(videoIdFromLink)
        setVideoId(videoIdFromLink);
    };

    const extractVideoId = (link) => {
        const regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})$/;
        const match = link.match(regExp);
        return match ? match[1] : '';
    };

    const opts = {
        height: newHeight,
        width: newWidth,
        playerVars: {
            autoplay: 1,
        },
    };

    useEffect(() => {
        const list = localStorage.getItem("videoList");
        if (list) {
            const parsedList = JSON.parse(list);
            setVideoList(parsedList);
        }
    }, []);

    const addToList = () => {
        const updatedList = [...videoList, { id: videoId }];
        setVideoList(updatedList);
        localStorage.setItem("videoList", JSON.stringify(updatedList));
    };
    const changeVideo = (id) => {
        setVideoURL('')
        setVideoId(id)
    }
    const playNext = () => {
        const index = videoList.findIndex(obj => obj.id === videoId);
        if (index !== -1 && index < videoList.length - 1) {
            setVideoId(videoList[index + 1].id)
        }
    }
    return (
        <MainContainer>
            <FormElement onSubmit={handleSubmit}>
                <Input
                    type="text"
                    placeholder="Enter YouTube video link"
                    value={videoURL}
                    onChange={handleChange}
                />
                <Button type="submit">Play</Button>
            </FormElement>
            <PlayerContainer>
                <div>
                    {videoId && <YouTube
                        videoId={videoId}
                        opts={opts}
                        onEnd={playNext}
                    />}
                    <AddToListButton onClick={addToList}>Add To List</AddToListButton>
                </div>
                {videoList.length > 0 && <ListContainer>
                    <List videoList={videoList} changeVideo={changeVideo} />
                </ListContainer>}
            </PlayerContainer>
        </MainContainer>
    );
};

export default VideoPlayer;

const MainContainer = styled.div`
    margin-top: 20px;
`
const FormElement = styled.form`
    display:flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40px;
`;

const Input = styled.input`
    background-color: black;
    color: #ffff;
    border: none;
    height:50px;
    width: 100%;
    max-width: 400px;
    padding-left: 35px;
    border-radius: 20px;
    margin: 0 20px;
    &:focus-visible {
        outline: none;
    }
`;

const Button = styled.button`
  /* Define your styles here */
    padding: 10px 20px;
    font-size: 16px;
    background-color: #3498db;
    color: #ffffff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
        background-color: #2980b9;
    }

    &:focus {
        outline: none;
    }
`;
const AddToListButton = styled.button`
    padding: 10px 20px;
    margin-top: 20px;
    font-size: 16px;
    float: inline-end;
    background-color: #27ae60;
    color: #ffffff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    &:hover {
        background-color: #219d52;
    }

    &:focus {
        outline: none;
    }
`;

const PlayerContainer = styled.div`
    display: flex;
    gap: 20px;
`;

const ListContainer = styled.div`
    margin: 0 10px;
`