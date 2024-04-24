import React, { useEffect } from 'react';
import VideoPlayer from './VideoPlayer';
import styled from 'styled-components';
import Logo from './logo.svg'

function App() {
  useEffect(() => {
    if (!localStorage.getItem("videoList")) {
      localStorage.setItem("videoList", "[]")
    }
  },[])

  return (
    <AppConatiner className="App">
      <LogoImg src={Logo} alt='logo' />
      <SubTitle>Enjoy Ad Free YouTube videos</SubTitle>
      <VideoPlayer />
    </AppConatiner>
  );
}

export default App;

const AppConatiner = styled.div`
  display: grid;
  place-items: center;
  color: #FFFF;
  background-color: #121212;
  margin: 0 40px;
  padding: 20px 60px;
  @media (max-width: 968px) {
    padding: 0;
    }
`;

const LogoImg = styled.img`
  height: 100px;
  width: 400px;
  @media (max-width: 968px) {
    width: 300px;
    }
`;

const SubTitle = styled.p`
  margin-top: 0;
`
