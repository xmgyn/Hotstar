import List from '../components/List'
import Navbar from '../components/Navbar'
import Like from '../assets/Like'
import Play from '../assets/Play'
import Splash from './Splash'
import React, { useContext, useEffect, useState } from "react";
import { DataContext } from "./../utility";

import './Home.css'

function Home() {
  const { data: cardData, context: currentContext, setPlay, setMeta, setDetails } = useContext(DataContext);

  const [load, setLoad] = useState(false);

  function setFavourite() {
    fetch(`http://192.168.0.110:4373/setFavourite/${currentContext._id}`).then(data => {

    })
      .catch(error => {
        console.error("Failed to set favourite:", error);
      })
  }

  function preparePlay(contentid, seasonid = null, seriesid = null) {
    setMeta(seriesid ? { seriesid: seriesid, seasonid: seasonid, id: contentid } : { id: contentid });
    fetch(`http://192.168.0.110:4373/getDetails/${contentid}`)
      .then(response => { if (response.ok) return response.json() })    // Throw Error If Not Found
      .then(data => {
        setDetails(data);
        setPlay(true);
      })
  }

  const handleSelect = (selectedIndex) => {
    const selectedEpisode = currentContext.Seasons[1].Episodes[selectedIndex];

    if (selectedEpisode) {
      preparePlay(
        selectedEpisode._id,
        currentContext.Seasons[1]._id,
        currentContext._id
      );
    }
  };

  useEffect(function () {
    if (!currentContext) return;
    const backgroundImageContainer = document.querySelector('div.Background-Image-Container');
    backgroundImageContainer.innerHTML = '';
    const backImg = document.createElement("img");
    backImg.classList.add('Background-Image');
    
    fetch(`http://192.168.0.110:4373/getBackground/${currentContext._id}`)
    .then(response => response.blob())
    .then(blob => {
        const imgURL = URL.createObjectURL(blob);
        backImg.src = imgURL;
        backgroundImageContainer.innerHTML = '';
        backgroundImageContainer.appendChild(backImg);
    })
  }, [currentContext])

  return (
    <React.Fragment>
      {load ? <Splash /> :
        <React.Fragment>
          <div className="Background-Image-Container">
          </div>
          <div className="Background-Image-Overlay"></div>
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
              <div>
                {currentContext && (currentContext.Seasons ?
                  <React.Fragment>
                    <div className="Hero-Play-Button" onClick={() => document.querySelector('div.Play-Item-List').style.display = "block"}>
                      <Play />
                      <div className="oxygen-regular">Start Watching</div>
                    </div>
                    <div className="Play-Item-List">
                      <div className="Play-Item-Heading oxygen-bold">Season 1</div>
                      {Object.values(currentContext.Seasons[1].Episodes).map((episode, index) => (
                        <div
                          key={index}
                          className="Play-Item oxygen-regular"
                          onClick={() => handleSelect(index + 1)}
                        >
                          Episode {index + 1} : {episode["Name"]}
                        </div>
                      ))}
                    </div>
                  </React.Fragment>
                  :
                  <div className="Hero-Play-Button" onClick={() => preparePlay(currentContext._id)}>
                    <Play />
                    <div className="oxygen-regular">Start Watching</div>
                  </div>)
                }
              </div>
              <div className="Hero-Favourite" onClick={setFavourite}><Like fill={currentContext && currentContext.Favourite ? "#fb0505" : "#00000000"} /></div>
            </div>
          </div>
          <List className="Play-List" />
        </React.Fragment>}
    </React.Fragment>
  )
}

export default Home
