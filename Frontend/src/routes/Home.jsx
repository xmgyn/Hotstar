import List from '../components/List'
import Navbar from '../components/Navbar'
import Like from '../assets/Like'
import Play from '../assets/Play'
import React, { useEffect, useRef, useContext } from "react";
import { DataContext } from "./../utility"; 

import './Home.css'

function Home() {
  const { data:cardData, context: currentContext, setPlay } = useContext(DataContext); 
  return (
    <>
      <div className="Hero-Image-Container">
        { cardData && currentContext && <img src={`http://192.168.0.110:4373/getBackground/${currentContext.id}`} style={{ minHeight: '100%', width: '100%', objectFit: 'cover' }} /> }
      </div>
      <div className="Hero-Image-Overlay"></div>
      <Navbar />
      <div className="Hero-Interact">
        <div className="Hero-Tags">
          <div className="Tag oxygen-regular">Animation</div>
          <div className="Tag oxygen-regular">60 FPS</div>
          <div className="Tag oxygen-regular">Adventure</div>
        </div>
        <div className="Hero-Image-Heading">
          <div className="Title-Image">{ currentContext && <img src={`http://192.168.0.110:4373/getIcon/${currentContext.id}`} /> }</div>
        </div>
        <div className="Interact">
          <div className="Hero-Play-Button">
            <Play />
            <div className="oxygen-regular" onClick={() => setPlay(true)}>Start Watching</div>
          </div>
          <div className="Hero-Favourite"><Like /></div>
        </div>
      </div>
      <List className="Play-List"/>
    </>
  )
}

export default Home
