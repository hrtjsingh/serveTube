'use client'
import React, { useEffect, useState } from 'react';
import YouTube from 'react-youtube';
import List from './List';
import styled from 'styled-components';
import { FaPlus, FaPlay } from "react-icons/fa";
import { Card } from './ui/card';

const VideoPlayer = () => {
    const [videoId, setVideoId] = useState<any>('s-4Fe83fwtM');
    const [videoURL, setVideoURL] = useState<any>('');
    const [videoList, setVideoList] = useState<any>([]);
    const originalWidth = 640;
    const originalHeight = 390;
    const newWidth = 800;
    const newHeight = Math.round((newWidth / originalWidth) * originalHeight);
    const handleChange = (e: any) => {
        setVideoURL(e.target.value);
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const videoIdFromLink = extractVideoId(videoURL);
        setVideoURL("");
        setVideoId(videoIdFromLink);
    };

    const extractVideoId = (link: any) => {
        const regExp = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ \r\n]{11})/;
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
        const index = videoList.findIndex((obj: any) => obj.id === videoId);
        if (index === -1) {
            const updatedList = [...videoList, { id: videoId }];
            setVideoList(updatedList);
            localStorage.setItem("videoList", JSON.stringify(updatedList));
        }
    };

    const deleteFromList = (id: any) => {
        const updatedList = videoList.filter((item: any) => item.id !== id);
        setVideoList(updatedList);
        localStorage.setItem("videoList", JSON.stringify(updatedList));
    };
    const changeVideo = (id: any) => {
        setVideoURL('')
        setVideoId(id)
    }
    const playNext = () => {
        const index = videoList.findIndex((obj: any) => obj.id === videoId);
        if (index !== -1 && index < videoList.length - 1) {
            setVideoId(videoList[index + 1]?.id)
        } else if (index !== -1 && index === videoList.length - 1) {
            setVideoId(videoList[0]?.id)
        }
    }

    return (
        <MainContainer>
            <FormElement onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-3xl mx-auto">
                <Input
                    type="text"
                    placeholder="Enter YouTube video link"
                    value={videoURL}
                    onChange={handleChange}
                    className="w-full text-sm md:text-md sm:w-2/3 p-3 rounded-md bg-black text-white border border-gray-700 focus:outline-none focus:border-purple-500"
                />
                <Button
                    type="submit"
                    disabled={videoURL.length === 0}
                    className="w-[50%] sm:w-auto px-5 py-1 bg-purple-600 text-white rounded-md flex items-center justify-center gap-1.5 hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FaPlay className="text-sm" />
                    <span>Play</span>
                </Button>
            </FormElement>
            <PlayerContainer>
                <PlayerSec>
                    {videoId &&
                        <Card className='p-0 border-none'>
                            <div className="relative">
                                <div className="absolute -inset-2 rounded-lg opacity-50 blur-2xl animate-gradient"></div>
                                <div className="relative flex w-full h-full items-center justify-center border-none rounded-lg bg-zinc-900 text-slate-300">
                                    <YouTube
                                        className='rounded-md'
                                        videoId={videoId}
                                        opts={opts}
                                        onEnd={playNext}
                                    />
                                </div>
                            </div>
                        </Card>
                    }
                    <AddToListButton
                        onClick={addToList}
                        disabled={videoList.findIndex((obj: any) => obj.id === videoId) === 1}
                        className="w-full sm:w-auto mt-4 px-4 py-2 text-sm sm:text-base flex items-center justify-center gap-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaPlus className="text-sm" />
                        <span>Add To List</span>
                    </AddToListButton>
                </PlayerSec>
                {videoList.length > 0 && (
                    <div className='mx-3 sm:mx-4 md:mx-5 lg:mx-6 mt-6 md:mt-0'>
                        <Card className='mb-4 overflow-visible w-full max-w-full sm:max-w-[480px] md:max-w-[640px] lg:max-w-[800px] xl:max-w-[960px]'>
                            <List
                                videoList={videoList}
                                changeVideo={changeVideo}
                                deleteVideo={deleteFromList}
                                playingVideo={videoId}
                                className='w-full'
                            />
                        </Card>
                    </div>
                )}
            </PlayerContainer>
        </MainContainer >
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
    margin-bottom: 60px;
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
    padding: 10px 20px;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap:4px;
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
    display: flex;
    align-items: center;
    gap: 4px;
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
    &:disabled{
        background-color: #78a78ba8;
        cursor: not-allowed;
    }
`;

const PlayerContainer = styled.div`
    display: flex;
    gap: 20px;
    @media (max-width: 980px) {
        flex-direction: column;
    }
`;

const ListContainer = styled.div`
    margin: 0 10px;
`;

const PlayerSec = styled.div`
    flex:1;
    @media (max-width: 980px) {
        iframe{
        height: 200px;
        width: 100%;
    }
    }
`
