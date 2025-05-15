import List from '../components/List'
import Navbar from '../components/Navbar'
import Like from '../assets/Like'
import Play from '../assets/Play'
import Splash from './Splash'
import React, { useContext, useState } from "react";
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

  return (
    <React.Fragment>
      {load ? <Splash /> :
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
              {currentContext && (currentContext.Seasons ?


                <select
                  className="Hero-Play-Button"
                  name="Season 1"
                  id="cars"
                  onChange={(event) => {
                    const selectedIndex = event.target.selectedIndex;
                    const selectedOption = event.target.options[selectedIndex];
                    selectedOption.value && preparePlay(
                      currentContext.Seasons[1].Episodes[selectedIndex]._id,
                      currentContext.Seasons[1]._id,
                      currentContext._id
                    );
                  }}
                >
                  <optgroup label="Season 1">
                    <option value="1">Episode 2</option>
                    <option value="0">Episode 1</option>
                  </optgroup>
                </select>

                :
                <div className="Hero-Play-Button" onClick={() => preparePlay(currentContext._id)}>
                  <Play />
                  <div className="oxygen-regular">Start Watching</div>
                </div>)
              }
              <div className="Hero-Favourite" onClick={setFavourite}><Like fill={currentContext && currentContext.Favourite ? "#fb0505" : "#00000000"} /></div>
            </div>
          </div>
          <List className="Play-List" />
        </React.Fragment>}
    </React.Fragment>
  )
}

export default Home
