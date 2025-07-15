'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { SlOptionsVertical } from "react-icons/sl";
import { FaPlay } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

import useClickOutside from '@/utils/useClickOutside';
import { Card, CardContent } from './ui/card';


const VideoInfo = ({ id, index, changeVideo, deleteVideo, playingVideo }: any) => {
    const [videoInfo, setVideoInfo] = useState<any>(null);
    const [showOptions, setShowOptions] = useState(false);
    const [error, setError] = useState("");
    const key = process.env.NEXT_PUBLIC_API_KEY
    const ref = useClickOutside(() => setShowOptions(false));
    const getData = async () => {
        try {
            const response = await axios.get(
                `https://www.googleapis.com/youtube/v3/videos?key=${key}&part=snippet&id=${id}`
            );

            setVideoInfo(response.data.items[0].snippet);
            setError("");
        } catch (err) {
            setError('Video not found or API request failed.');
            setVideoInfo(null);
        }
    };

    useEffect(() => {
        getData()
    }, [id])

    
    return (
        <>
            {error && <CardContent><p>{error}</p></CardContent>}
            {videoInfo && (
                <CardContent className='p-2 '>
                    <div className='flex items-center p-2 gap-2 w-full rounded-md relative hover:bg-slate-500 transition-colors duration-300 ease-in-out'>
                        <span className='w-10 text-sm text-center'>{playingVideo ? <FaPlay className='text-sm md:text-md' /> : index + 1}</span>
                        <div className='flex items-center flex-row md:w-[400px] gap-2 md:gap-4 cursor-pointer' onClick={() => { changeVideo(id) }}>
                            <img src={videoInfo?.thumbnails?.default?.url} alt="Thumbnail" className='w-[65px] md:w-[120px]' />
                            <h5 className='space-x-5 text-xs md:text-base'>{videoInfo?.title?.split(' ').slice(0, 10).join(' ')}{videoInfo?.title?.split(' ').length > 10 ? '...' : ''}</h5>
                        </div>
                        <div className='user-select-none relative '>
                            <SlOptionsVertical className='cursor-pointer' size="16px" onClick={() => { setShowOptions(!showOptions) }} />
                            {showOptions && <div className="absolute flex items-center justify-center top-[120%] z-40 right-[-65%] p-2 font-semibold bg-[#f0f8ff] text-black rounded hover:bg-[#a7b0b8]" ref={ref as any}>
                                <div className='cursor-pointer'>
                                    <MdDelete className='cursor-pointer' color='red' size="20px" onClick={() => { deleteVideo(id) }} />
                                </div>
                            </div>}
                        </div>
                    </div>
                </CardContent>
            )}
        </>
    )
};

export default VideoInfo;


const VideoInfoMain = styled.div`
    position: relative;
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
    @media (max-width: 968px) {
        margin: 20px 0;
    }
`;

const TitleContainer = styled.div`
    display: flex;
    max-width: 450px;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    & img{
        margin-right: 20px;
    }
    @media (max-width: 968px) {
        margin: 20px 0;
        flex-direction: column;
        text-align: center;
        gap: 10px;
    }
`;

const OptionContainer = styled.div`
    /* position: relative;ss */
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
