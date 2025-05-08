import List from '../components/List'
import Navbar from '../components/Navbar'
import Like from '../assets/Like'
import Play from '../assets/Play'
import React, { useContext } from "react";
import { DataContext } from "./../utility";

import './Home.css'

function Home() {
  const { data: cardData, context: currentContext, setPlay } = useContext(DataContext);

  function setFavourite() {
    fetch(`http://192.168.0.110:4373/setFavourite?contentId=${currentContext._id}`).then(data => {
      
    })
      .catch(error => {
        console.error("Failed to set favourite:", error);
      })
  }

  return (
    <React.Fragment>
      <div className="Hero-Image-Container">
        {cardData && currentContext && <img src={`http://192.168.0.110:4373/getBackground/${currentContext._id}`} style={{ minHeight: '100%', width: '100%', objectFit: 'cover' }} />}
      </div>
      <div className="Hero-Image-Overlay"></div>
      <Navbar />
      <div className="Hero-Interact">
        <div className="Hero-Tags">
          <div className="Tag oxygen-regular">{currentContext && currentContext.Tags[0]}</div>
          <div className="Tag oxygen-regular">{currentContext && currentContext.Tags[1]}</div>
          <div className="Tag oxygen-regular">{currentContext && currentContext.Tags[2]}</div>
        </div>
        <div className="Hero-Image-Heading">
          <div className="Title-Image">{currentContext && <img src={`http://192.168.0.110:4373/getIcon/${currentContext._id}`} />}</div>
        </div>
        <div className="Interact">
          <div className="Hero-Play-Button" onClick={() => setPlay(true)}>
            <Play />
            <div className="oxygen-regular">Start Watching</div>
          </div>
          <div className="Hero-Favourite" onClick={setFavourite}><Like fill={currentContext && currentContext.Favourite ? "#fb0505" : "#00000000"} /></div>
        </div>
      </div>
      <List className="Play-List" />
    </React.Fragment>
  )
}

export default Home
