'use client'
import React, { useEffect, useState } from 'react';
import YouTube from 'react-youtube';
import { useClerk } from "@clerk/nextjs";
import List from './List';
import styled from 'styled-components';
import { FaPlus, FaPlay } from "react-icons/fa";
import { Card } from './ui/card';
import { useUser } from "@clerk/nextjs";
import axios from 'axios';
const VideoPlayer = () => {
    const clerk = useClerk();
    const [videoId, setVideoId] = useState<any>('36AKk9A5gH8');
    const [videoURL, setVideoURL] = useState<any>('');
    const [playlistId, setPlaylistId] = useState<any>('');
    const [videoList, setVideoList] = useState<any>([{ id: '36AKk9A5gH8' }, { id: 'TqXxNkP93Z8' }]);
    const originalWidth = 640;
    const originalHeight = 390;
    const newWidth = 800;
    const newHeight = Math.round((newWidth / originalWidth) * originalHeight);
    const { isSignedIn, user } = useUser();

    const checkUserInfo = async () => {
        try {
            const payload = {
                googleId: user?.id,
                name: user?.fullName,
                email: user?.emailAddresses[0].emailAddress
            }
            const res = await axios.post("api/users/save", JSON.stringify(payload))

            if (res.status == 200) {
                const { user, type } = res.data
                console.log(user, type)
                if (type !== "user") {
                    const payload = {
                        userId: user._id,
                        songs: [{ id: '36AKk9A5gH8' }, { id: 'TqXxNkP93Z8' }]
                    }

                    const playlistData = await axios.post("api/playlists/add", JSON.stringify(payload))

                    if (playlistData.status === 200) {
                        const list = playlistData.data.playlist.songs
                        setVideoList(list)
                        setPlaylistId(playlistData.data.playlist._id)
                        setVideoId(list[0].id)
                    }
                } else {
                    getUserPlaylist(user._id)
                }
            }
        } catch (e) {
            console.log(e)
        }
    }

    const getUserPlaylist = async (userId: string) => {
        try {
            if (userId) {
                const playlistData = await axios.get(`api/users/${userId}`)
                if (playlistData.status === 200) {
                    const list = playlistData.data.playlist.songs
                    setVideoList(list)
                }
            }
        } catch (e) {
            console.log(e)
        }
    }

    const addVideoToList = async () => {
        try {
            const payload = {
                id: videoId
            }
            if (playlistId) {
                const playlistData = await axios.post(`api/playlists/${playlistId}/add-song`, JSON.stringify(payload))
                if (playlistData.status === 200) {
                    const list = playlistData.data.playlist.songs
                    setVideoList(list)
                }
            }
        } catch (e) {
            console.log(e)
        }
    }

    const deleteVideoToList = async (videoId: string) => {
        try {
            const payload = {
                id: videoId,
            };

            if (playlistId) {
                const playlistData = await axios.delete(
                    `/api/playlists/${playlistId}/delete-song`,
                    { data: payload }
                );

                if (playlistData.status === 200) {
                    const list = playlistData.data.playlist.songs;
                    setVideoList(list);
                }
            }
        } catch (e) {
            console.error("Delete error:", e);
        }
    };

    useEffect(() => {
        if (isSignedIn) {
            checkUserInfo()
        }
    }, [isSignedIn])

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
        // const list = localStorage.getItem("videoList");
        // if (list) {
        //     const parsedList = JSON.parse(list);
        //     const combinedList = [...videoList, ...parsedList];
        //     const uniqueList = combinedList.filter(
        //         (item, index, self) =>
        //             index === self.findIndex((v) => v.id === item.id)
        //     );

        //     setVideoList(uniqueList);
        // }
    }, []);

    const addToList = () => {
        if (!isSignedIn) {
            clerk.openSignIn({})
        }
        const index = videoList?.findIndex((obj: any) => obj.id === videoId);
        if (index === -1) {
            const updatedList = [...videoList, { id: videoId }];
            // setVideoList(updatedList);
            addVideoToList()
            // localStorage.setItem("videoList", JSON.stringify(updatedList));
        }
    };

    const deleteFromList = (id: any) => {
        console.log(id)
        const updatedList = videoList?.filter((item: any) => item.id !== id);
        // setVideoList(updatedList);
        deleteVideoToList(id)
        // localStorage.setItem("videoList", JSON.stringify(updatedList));
    };

    const changeVideo = (id: any) => {
        setVideoURL('')
        setVideoId(id)
    }
    const playNext = () => {
        const index = videoList?.findIndex((obj: any) => obj.id === videoId);
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
                    className="w-full text-sm md:text-md sm:w-2/3 p-3 rounded-md bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-purple-500 shadow-md"
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
                        disabled={videoList?.findIndex((obj: any) => obj.id === videoId) === 1}
                        className="w-full sm:w-auto mt-4 px-4 py-2 text-sm sm:text-base flex items-center justify-center gap-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaPlus className="text-sm" />
                        <span>Add To List</span>
                    </AddToListButton>
                </PlayerSec>
                {videoList?.length > 0 && (
                    <div className='mx-3 sm:mx-4 md:mx-5 lg:mx-6 mt-6 md:mt-0'>
                        <Card className='mb-4 overflow-visible w-full max-w-full sm:max-w-[480px] md:max-w-[640px] lg:max-w-[800px] xl:max-w-[960px]'>
                            <List
                                videoList={videoList}
                                setVideoList={setVideoList}
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
    /* background-color: black; */
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
