import React, { useEffect } from 'react';
import VideoPlayer from './VideoPlayer';
import styled from 'styled-components';
import Logo from './logo.svg'

function App() {
  useEffect(() => {
    if (!localStorage.getItem("videoList")) {
      localStorage.setItem("videoList", "[]")
    }
  },)

  return (
    <AppConatiner className="App">
      <img src={Logo} height={100} width={400} />
      <p>Enjoy Ad Free YouTube videos</p>
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
`