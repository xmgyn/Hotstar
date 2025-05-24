import React, { useEffect, useState } from "react";

import { Image, Icon } from "./Assets";

function Splash() {
  return (
    <Fragment>
      <div className="Splash"></div>
    </Fragment>
  )
}

function Error(msg) {
  return (
    <div>{msg}</div>
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
        <div className="Profile"><img src="avatar.png" /></div>
      </div>
    </div>
  )
}

function Card({ id, className }) {
  let iconUrl, previewUrl, backgroundUrl;

  useEffect(() => {
    const cardimg = new Image();
    const iconimg = new Image();
    const previewimg = new Image();
    const backgroundimg = new Image();

    cardimg.src = `/getCard/${id}`;
    iconimg.src = `/getIcon/${id}`;
    previewimg.src = `/getPreview/${id}`;
    backgroundimg.src = `/getBackground/${id}`;

    const cardBlob = cardimg.blob();
    const iconBlob = iconimg.blob();
    const previewBlob = previewimg.blob();
    const backgroundBlob = backgroundimg.blob();

    const cardUrl = URL.createObjectURL(cardimg);
    const iconUrl = URL.createObjectURL(iconBlob);
    const previewUrl = URL.createObjectURL(previewimg);
    const backgroundUrl = URL.createObjectURL(backgroundimg);
  }, []);

  return (
    <div id={id} className={"Card" + ((className) ? ' ' + className : '')} onClick={() => handleCardClick(event, iconUrl, previewUrl, backgroundUrl)}>
      <img src={cardUrl} />
    </div>
  )
}

function handleCardClick(card, iconUrl, previewUrl, backgroundUrl) {
  // prefview Image containewr means Card Itself
  card.event.target.innerHTML = '';
  const previewImage = document.createElement("img");
  previewImage.src = previewUrl;
  previewImageContainer.appendChild(previewImage);

  backgroundImageContainer.innerHTML = '';
  const backgroundImage = document.createElement("img");
  backgroundImage.classList.add('Background-Image');
  backgroundImage.src = backgroundUrl;
  backgroundImageContainer.appendChild(backgroundImage);

  iconImageContainer.innerHTML = '';
  const iconImage = document.createElement("img");
  iconImage.src = iconUrl;
  iconImageContainer.appendChild(iconImage);

  tagsContainer.innerHTML = '';
  Tags.forEach(tag => {
    const tagElement = document.createElement('div');
    tagElement.className = 'Tag oxygen-regular';
    tagElement.textContent = tag;
    tagsContainer.appendChild(tagElement);
  });

  // Change It To Chage Play Context
  setContext(card);
}

function List({ cardData, setContext, className }) {
  useEffect(() => {
    if (cardData && cardData.length > 0) {
      setSelectedCard(cardData[0]._id);
      changeContext(cardData[0]);
    }

    const arrowLeft = document.querySelector('.Arrow-Left');
    const arrowRight = document.querySelector('.Arrow-Right');
    const horizontalCard = document.querySelector('.Horizontal-Card');

    const scrollLeft = () => {
      horizontalCard.scrollBy({
        left: -200,
        behavior: 'smooth'
      });
    };

    const scrollRight = () => {
      horizontalCard.scrollBy({
        left: 200,
        behavior: 'smooth'
      });
    };

    arrowLeft.addEventListener("click", scrollLeft);
    arrowRight.addEventListener("click", scrollRight);

    // Cleanup Function (Useful inside useEffect in React)
    function removeEventListeners() {
      arrowLeft.removeEventListener("click", scrollLeft);
      arrowRight.removeEventListener("click", scrollRight);
    }

    {
          cardData && cardData.map(
            (item, index) => {
              const extraProps = {
              };

              return (
                item && <Card key={item._id} id={item._id} {...extraProps} />
              );
            })
        }

    // If used inside React, call removeEventListeners inside useEffect cleanup
    return () => {
      removeEventListeners(); // Cleans up when the component unmounts
      URL.revokeObjectURL(images.icon);
      URL.revokeObjectURL(images.background);
    };

  }, [cardData]);

  return (
    <div className={className}>
      <div className="Card-Heading">
        <div className="Text-Heading oxygen-bold">Collections</div>
        <div className="Navigate">
          <div className="Arrow-Left"><Icon type={"Left"} /></div>
          <div className="Arrow-Right"><Icon type={"Left"} /></div>
        </div>
      </div>
      <div className="Horizontal-Card">
        
      </div>
    </div>
  )
}

function Home({ data: cardData, context: currentContext, setPlay, setMeta, setDetails }) {
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
            </div>
            <div className="Hero-Image-Heading">
              <div className="Title-Image"></div>
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
              <div className="Hero-Favourite" onClick={setFavourite}><Icon type={"Like"} fill={currentContext && currentContext.Favourite ? "#fb0505" : "#00000000"} /></div>
            </div>
          </div>
          <List className="Play-List" />
        </React.Fragment>}
    </React.Fragment>
  )
}

export default Home
