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

function Navbar() {
  const shift = (event) => {
    document.querySelector("div.Nav-Active").classList.remove('Nav-Active');
    event.target.classList.add("Nav-Active");
    changeTab(event.target.firstChild.data);
  }

  return (
    <div className="Navbar">
      <div className="Nav-Left">
        <div className="Nav-Item Nav-Active oxygen-bold" onClick={shift}>Home</div>
        <div className="Nav-Item oxygen-bold" onClick={shift}>Movies</div>
        <div className="Nav-Item oxygen-bold" onClick={shift}>Series</div>
        <div className="Nav-Item oxygen-bold" onClick={shift}>Favourites</div>
      </div>
      <div className="Nav-Right">
        <div className="Search-Box"></div>
        <div className="Profile"><img src="IMG_2784.JPG" /></div>
      </div>
    </div>
  )
}

function preparePlay(contentid, seasonid = null, seriesid = null) {
  setMeta(seriesid ? { seriesid: seriesid, seasonid: seasonid, id: contentid } : { id: contentid });
  fetch(`/getDetails/${contentid}`)
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

function Home({ cardData, currentView, set, query }) {
  const [splashNegative, setSplashNegative] = useState(false);
  const [load, setLoad] = useState(false);

  const horizontalCard = useRef(null);

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

      setSplashNegative(true);

      backgroundImageContainer = document.querySelector("div.Background-Image-Container");
      iconImageContainer = document.querySelector("div.Title-Image");
      tagsContainer = document.querySelector("div.Hero-Tags");

      // Keep The Spinner On

      if (horizontalCard.current) horizontalCardElements.forEach(card => horizontalCard.current.appendChild(card));

      // Turn Off The Spinner

      CardSelect(cardData[0]);
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

  return (
    <React.Fragment>
      {
        splashNegative ?
          <React.Fragment>
            <div className="Background-Image-Container">
            </div>
            <div className="Background-Image-Overlay"></div>
            <Navbar />
            <div className="Hero-Interact">
              <div className="Hero-Tags">
              </div>
              <div className="Hero-Image-Heading">
                <div className="Title-Image"></div>
              </div>
              <div className="Interact">
                <div>
                  {currentView && currentView.Seasons ?
                    <React.Fragment>
                      <div className="Hero-Play-Button" onClick={() => document.querySelector('div.Play-Item-List').style.display = "block"}>
                        <Icon type={"Play"} />
                        <div className="oxygen-regular">Start Watching</div>
                      </div>
                      <div className="Play-Item-List">
                        {Object.entries(currentView.Seasons).map(([seasonNumber, seasonData]) => (
                          <div key={seasonNumber}>
                            <div className="Play-Item-Heading oxygen-bold">Season {seasonNumber}</div>
                            {Object.values(seasonData.Episodes).map((episode) => (
                              <div key={episode["Number"]} className="Play-Item oxygen-regular" onClick={preparePlay}>
                                Episode {episode["Number"]} : {episode["Name"]}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </React.Fragment>
                    :
                    <div className="Hero-Play-Button" onClick={preparePlay}>
                      <Icon type={"Play"} />
                      <div className="oxygen-regular">Start Watching</div>
                    </div>
                  }
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
                </div>
              </div>
              <div ref={horizontalCard} className="Horizontal-Card">
              </div>
            </div>
          </React.Fragment>
          : <Splash />
      }
    </React.Fragment>
  )
}

export default Home