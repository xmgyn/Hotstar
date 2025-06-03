import React, { Fragment, useEffect, useRef, useState } from "react";

import { Icon } from "./Assets";

// Complete
async function CardBlob(id) {
  const urls = {
    cardImg: `http://192.168.0.110:4373/getCard/${id}`,
    iconImg: `http://192.168.0.110:4373/getIcon/${id}`,
    previewImg: `http://192.168.0.110:4373/getPreview/${id}`,
    backgroundImg: `http://192.168.0.110:4373/getBackground/${id}`,
  };

  const fetchBlob = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch ${url}`);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      return null;
    }
  };

  const blobs = await Promise.all(
    Object.keys(urls).map(async (key) => ({ [key]: await fetchBlob(urls[key]) }))
  );

  return Object.assign({}, ...blobs);
}

function Splash() {
  return (
    <Fragment>
      <div className="Splash"></div>
    </Fragment>
  )
}

function Account() {
  useEffect(function () {

  }, [])
}

function Navbar({ tab, changeTab }) {
  const shift = (event) => {
    const navActive = document.querySelector("div.Nav-Active");
    if (navActive) navActive.classList.remove('Nav-Active');
    document.title = event.target.firstChild.data + ' | Hotstar';
    changeTab(event.target.firstChild.data);
  }

  useEffect(() => {
    const activeTab = Array.from(document.querySelectorAll(".Nav-Item")).find((item) => item.textContent === tab);
    document.querySelector("div.Nav-Active")?.classList.remove("Nav-Active");
    activeTab.classList.add("Nav-Active");
  },[])

  return (
    <div className="Navbar">
      <div className="Nav-Item oxygen-bold" onClick={shift}>Home</div>
      <div className="Nav-Item oxygen-bold" onClick={shift}>Movies</div>
      <div className="Nav-Item oxygen-bold" onClick={shift}>Series</div>
      <div className="Nav-Item oxygen-bold" onClick={shift}>Favourites</div>
    </div>
  )
}

function Home({ cardData, tab, currentView, splashNegative, set, query }) {
  const [load, setLoad] = useState(false);

  const horizontalCard = useRef(null);
  const PlayItemList = useRef(null);

  let cardContainer, tagsContainer, iconImageContainer, backgroundImageContainer;

  useEffect(() => {
    if (!cardData) return;

    cardData = cardData.slice(0, 4);

    async function LoadCard() {
      // Fetch All Image And Prepare Blob URLs
      await Promise.all(
        cardData.map(async (item, index) => {
          try {
            const blob = await CardBlob(item._id);
            Object.assign(cardData[index], blob);
          } catch (error) {
            console.error(`Failed to fetch blob for ${item._id}:`, error);
            Object.assign(cardData[index], { cardImg: null, iconImg: null, previewImg: null, backgroundImg: null });
          }
        })
      );

      // Prepare The Cards
      const horizontalCardElements = [];
      const imageElements = cardData.map((item) => {
        const cardDiv = document.createElement("div");
        const img = document.createElement("img");
        cardDiv.className = "Card";
        cardDiv.key = item._id;
        cardDiv.id = item._id;
        img.src = item.cardImg;
        cardDiv.appendChild(img);
        cardDiv.onclick = () => CardSelect(item);
        horizontalCardElements.push(cardDiv);
        return img;
      });
      await Promise.all(
        imageElements.map((img) =>
          new Promise((resolve) => {
            if (img.complete && img.naturalHeight !== 0) {
              resolve();
            } else {
              img.onload = resolve;
              img.onerror = resolve;
            }
          })
        )
      );
      
      backgroundImageContainer = document.querySelector("div.Background-Image-Container");
      iconImageContainer = document.querySelector("div.Title-Image");
      tagsContainer = document.querySelector("div.Hero-Tags");

      // Keep The Spinner On

      if (horizontalCard.current) {
        horizontalCard.current.innerHTML = "";
        horizontalCardElements.forEach(card => horizontalCard.current.appendChild(card));
        CardSelect(cardData[0]);
      }

      set.setSplashNegative(true);
      // Turn Off The Spinner
    }
    LoadCard();
    // LoadCards Should Perform Pagination Of Data, Also Discard If Insufficient Data

    return () => {
      // Clean The Cards
      // URL.revokeObjectURL(images.icon);
      // URL.revokeObjectURL(images.background);
    };

  }, [cardData]);


  function CardSelect(content) {
    const prevSelect = document.querySelector('div.Preview-Card');
    if (prevSelect) {
      prevSelect.classList.remove('Preview-Card');
      prevSelect.removeChild(prevSelect.children[1]);
    }

    cardContainer = document.getElementById(content._id);

    const previewImage = document.createElement("img");
    previewImage.src = content.previewImg;
    cardContainer.classList.add('Preview-Card');
    cardContainer.appendChild(previewImage);

    backgroundImageContainer.innerHTML = '';
    const backgroundImage = document.createElement("img");
    backgroundImage.classList.add('Background-Image');
    backgroundImage.src = content.backgroundImg;
    backgroundImageContainer.appendChild(backgroundImage);

    iconImageContainer.innerHTML = '';
    const iconImage = document.createElement("img");
    iconImage.src = content.iconImg;
    iconImageContainer.appendChild(iconImage);

    tagsContainer.innerHTML = '';
    content.Tags.forEach(tag => {
      const tagElement = document.createElement('div');
      tagElement.className = 'Tag oxygen-regular';
      tagElement.textContent = tag;
      tagsContainer.appendChild(tagElement);
    });

    set.setContext(content);
  }

  function setFavourite() {
    fetch(`http://192.168.0.110:4373/setFavourite/${currentView._id}`).then(data => {
      if (data.status === 200) set.setContext({ ...currentView, Favourite: !currentView.Favourite });
      else throw new Error("Something Went Wrong");
    }).catch(error => { console.error("Failed to set favourite:", error) })
  }

  function getFavourite() {
    return currentView.Favourite ? "#fb0505" : "#00000000";
  }

  function preparePlay() {
    if (currentView.Seasons) {
      if (PlayItemList.current) {
        PlayItemList.current.innerHTML = "";

        /*
<div className="Play-Item-List"> {
Object.entries(currentView.Seasons).map(([seasonNumber, seasonData]) => ( 
  <div key={seasonNumber}> <div className="Play-Item-Heading oxygen-bold">Season {seasonNumber}</div> {Object.values(seasonData.Episodes).map((episode) => ( <div key={episode["Number"]} className="Play-Item oxygen-regular" onClick={preparePlay}> Episode {episode["Number"]} : {episode["Name"]} </div> ))} </div> ))} </div>
        */

        Object.entries(currentView.Seasons).forEach(([seasonNumber, seasonData]) => {
          const seasonDiv = document.createElement("div");
          const headingDiv = document.createElement("div");
          headingDiv.className = "Play-Item-Heading oxygen-bold";
          headingDiv.textContent = `Season ${seasonNumber}`;
          seasonDiv.appendChild(headingDiv);

          Object.values(seasonData.Episodes).forEach((episode) => {
            const episodeDiv = document.createElement("div");
            episodeDiv.className = "Play-Item oxygen-regular";
            episodeDiv.textContent = `Episode ${episode["Number"]} : ${episode["Name"]}`;
            episodeDiv.onclick = () => preparePlay(episode);
            seasonDiv.appendChild(episodeDiv);
          });

          PlayItemList.current.appendChild(seasonDiv);


        });
      }
    }
    else {

    }
  }

  function startPlay() {
    // Fetch Audio And Details First, Then Play

    // set.setMeta({ seriesid: seriesid, seasonid: seasonid, id: contentid });
    // fetch(`/getDetails/${contentid}`)
    //   .then(response => { if (response.ok) return response.json() })    // Throw Error If Not Found
    //   .then(data => {
    //     setDetails(data);
    //     setPlay(true);
    //   })

    // setMeta({ id: contentid });
    // fetch(`/getDetails/${contentid}`)
    //   .then(response => { if (response.ok) return response.json() })    // Throw Error If Not Found
    //   .then(data => {
    //     setDetails(data);
    //     setPlay(true);
    //   })
  }

  return (
    <React.Fragment>
      <React.Fragment>
              <div className="Background-Image-Container">
              </div>
              <div className="Background-Image-Overlay"></div>
              <Navbar tab={tab} changeTab={set.setTab} />
              <div className="Hero-Interact">
                <div className="Hero-Tags">
                </div>
                <div className="Hero-Image-Heading">
                  <div className="Title-Image"></div>
                </div>
                <div className="Interact">
                  <div>
                    <div className="Hero-Play-Button" onClick={preparePlay}>
                      <Icon type={"WatchNow"} />
                      <div className="oxygen-regular">Start Watching</div>
                    </div>
                  </div>
                  {currentView && <div className="Hero-Favourite" onClick={setFavourite}><Icon type={"Like"} fill={getFavourite(currentView)} /></div>}
                </div>
              </div>
              <div className="Play-List">
                <div className="Card-Heading">
                  <div className="Text-Heading oxygen-bold">Collections</div>
                  <div className="Navigate">
                    <div className="Arrow-Left"><Icon type={"Left"} /></div>
                    <div className="Arrow-Right"><Icon type={"Left"} /></div>
                    <div className="Profile"><img src="IMG_2785.JPG" /></div>
                  </div>
                </div>
                <div ref={horizontalCard} className="Horizontal-Card">
                </div>
              </div>
      </React.Fragment>
      { splashNegative ? <React.Fragment /> : <Splash /> }
      {/* <div className="Background-Image-Overlay Extra-Overlay">
        <Icon type={"PopUpClose"} />
      </div>
      <div ref={PlayItemList} className="Play-Item-List Over-Block" /> 
      <div className="Developer-Settings Over-Block">
        <div className="Developer-Ping"></div>
        <div className="Developer-Code">
          <input />
        </div>
        <div className="Developer-Details"></div>
        <div className="Developer-Logs">
          <table className="Logs-Table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {Object.values({
  "0": {
    "timestamp": "2025-06-02T09:43:53.249Z",
    "message": "MongoDB Connected"
  },
  "1": {
    "timestamp": "2025-06-02T09:44:04.339Z",
    "message": "Successful Fetching : {\"_id\":\"682893f78c811c4ea967427f\"}"
  },
  "2": {
    "timestamp": "2025-06-02T09:44:04.384Z",
    "message": "Successful Updating : {\"$set\":{\"Favourite\":true}}"
  },
  "3": {
    "timestamp": "2025-06-02T09:44:04.384Z",
    "message": "Sucessfully Set Favourite : 682893f78c811c4ea967427f"
  },
  "4": {
    "timestamp": "2025-06-02T09:44:49.389Z",
    "message": "Successful Fetching : {\"_id\":\"681a3f8f9895e2705697eddc\"}"
  },
  "5": {
    "timestamp": "2025-06-02T09:44:49.392Z",
    "message": "Successful Fetching : {\"_id\":\"682893f78c811c4ea967427f\"}"
  },
  "6": {
    "timestamp": "2025-06-02T09:44:49.393Z",
    "message": "Successful Fetching : {\"_id\":\"68284c4fcc05eb920967427f\"}"
  },
  "7": {
    "timestamp": "2025-06-02T09:44:49.396Z",
    "message": "Successful Fetching : {\"_id\":\"6828e8308c8c5f371567427f\"}"
  },
  "8": {
    "timestamp": "2025-06-02T09:44:49.397Z",
    "message": "Successful Fetching : {\"_id\":\"68298d4c15356e59b467427f\"}"
  },
  "9": {
    "timestamp": "2025-06-02T09:44:49.403Z",
    "message": "Successful Fetching : {\"_id\":\"6829d4bb3d2e852a3467427f\"}"
  },
  "10": {
    "timestamp": "2025-06-02T09:44:49.404Z",
    "message": "Successful Fetching : {\"_id\":\"682a8590c68131c89967427f\"}"
  },
  "11": {
    "timestamp": "2025-06-02T09:44:49.406Z",
    "message": "Successful Fetching : {\"_id\":\"682b12faca44e2836067427f\"}"
  }}).map((log, index) => (
                <tr key={index}>
                  <td>{log.timestamp}</td>
                  <td>{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>*/}
    </React.Fragment>
  )
}

export default Home