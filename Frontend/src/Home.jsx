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
      <div className="Splash">
        <div className="Splash-Element">
          <img src="logo.png" />
          <span class="Splash-loader"></span>
        </div>
      </div>
    </Fragment>
  )
}

function Navbar({ changeTab }) {
  const shift = (event) => {
    const navActive = document.querySelector("div.Nav-Active");
    if (navActive) navActive.classList.remove('Nav-Active');
    event.target.classList.add('Nav-Active');
    document.title = event.target.firstChild.data + ' | Hotstar';
    changeTab(event.target.firstChild.data);
  }

  return (
    <div className="Navbar">
      <div className="Nav-Item Nav-Active oxygen-bold" onClick={shift}>Home</div>
      <div className="Nav-Item oxygen-bold" onClick={shift}>Movies</div>
      <div className="Nav-Item oxygen-bold" onClick={shift}>Series</div>
      <div className="Nav-Item oxygen-bold" onClick={shift}>Favourites</div>
    </div>
  )
}

function Account({ rating, close, setRating }) {
  const LogsList = useRef(null);

  useEffect(function () {
    fetch(`http://192.168.0.110:4373/logs`).then(data => {
      if (data.status === 200) return data.json();
      else return;
    }).then(response => {
      if (!response) return;
      const processedLogs = Object.values(response).reverse().slice(0, 30);
      LogsList.current.innerHTML = '';
      processedLogs.map((log, index) => {
        const tr = document.createElement("tr");
        tr.key = index;
        const tdTimestamp = document.createElement("td");
        tdTimestamp.textContent = log.timestamp;
        const tdMessage = document.createElement("td");
        tdMessage.textContent = log.message;
        tr.appendChild(tdTimestamp);
        tr.appendChild(tdMessage);
        LogsList.current.appendChild(tr);
      });
    })
  }, [])

  return (
    <React.Fragment>
      <div className="Background-Image-Overlay Extra-Overlay">
        <div onClick={close}>
          <Icon type={"PopUpClose"} />
        </div>
      </div>
      <div className="Developer-Settings Over-Block">
        <div className="Developer-Ping"></div>
        <div className="Developer-Code oxygen-regular">
          <input value={rating} placeholder="Enter Developers Code" onChange={(e) => setRating(e.target.value)} />
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
            <tbody ref={LogsList}>
            </tbody>
          </table>
        </div>
      </div>
    </React.Fragment>
  )
}

function Home({ cardData, currentView, rating, splashNegative, set, query }) {
  const [load, setLoad] = useState(false);
  const [accountSettings, setAccountSettings] = useState(false);

  const horizontalCard = useRef(null);
  const playItemList = useRef(null);
  const lastCardRef = useRef(null);

  let cardContainer;

  // All Query Selectors
  const backgroundImageContainer = document.querySelector('div.Background-Image-Container');
  const iconImageContainer = document.querySelector('div.Title-Image');
  const tagsContainer = document.querySelector('div.Hero-Tags');
  const year = document.querySelector('div.Release-Year');
  const duration = document.querySelector('div.Release-Duration');

  useEffect(() => {
    if (!cardData) return;

    cardData = cardData.slice(0, 14);

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          console.log("You Reacheed The End");
        }
      },
      { rootMargin: "100px" }
    );

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

      // Keep The Spinner On

      if (horizontalCard.current) {
        horizontalCard.current.innerHTML = "";
        horizontalCardElements.forEach(card => horizontalCard.current.appendChild(card));
        const lastCard = document.createElement("div");
        lastCard.classList.add('More-Fetch');
        lastCard.innerHTML = '<span class="Splash-loader"></span>';
        horizontalCard.current.appendChild(lastCard);
        lastCardRef.current = lastCard;
        observer.observe(lastCardRef.current);
        CardSelect(cardData[0]);
      }

      document.title = 'Home | Hotstar';

      set.setSplashNegative(true);
      // Turn Off The Spinner
    }
    LoadCard();
    // LoadCards Should Perform Pagination Of Data, Also Discard If Insufficient Data

    return () => {
      // Clean The Cards
      // URL.revokeObjectURL(images.icon);
      // URL.revokeObjectURL(images.background);
      // if (lastCardRef.current) observer.unobserve(lastCardRef.current);
    };

  }, [cardData]);

  function CardSelect(content) {
    const prevSelect = document.querySelector('div.Preview-Card');
    if (prevSelect) {
      if (prevSelect.id === content._id) return;
      prevSelect.classList.remove('Preview-Card');
      while (prevSelect.children.length > 1) prevSelect.removeChild(prevSelect.children[1]);
    }

    const trailerView = document.querySelector('div.Preview-Trailer');
    if (trailerView) trailerView.classList.remove('Preview-Trailer');

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

    if (!content.Seasons) {
      year.innerHTML = content.Year;

      const hours = Math.floor(content.Duration / 60);
      const remainingMinutes = content.Duration % 60;

      duration.innerHTML = remainingMinutes === 0
        ? `${hours} Hour${hours !== 1 ? "s" : ""}`
        : hours === 0
          ? `${remainingMinutes} Minute${remainingMinutes !== 1 ? "s" : ""}`
          : `${hours} Hour${hours !== 1 ? "s" : ""} ${remainingMinutes} Minute${remainingMinutes !== 1 ? "s" : ""}`;
    }
    else {
      year.innerHTML = '';
      duration.innerHTML = '';
    }

    tagsContainer.innerHTML = '';
    content.Tags.forEach(tag => {
      const tagElement = document.createElement('div');
      tagElement.className = 'Tag oxygen-regular';
      tagElement.textContent = tag;
      tagsContainer.appendChild(tagElement);
    });

    fetch(`http://192.168.0.110:4373/getTrailer/${content._id}`).then(data => {
      if (data.status === 200) return data.blob();
      else return;
    }).then(response => {
      if (!response) return;
      const trailerVideo = document.createElement("video");
      trailerVideo.src = URL.createObjectURL(response);
      cardContainer.classList.add('Preview-Trailer');
      const stopPreview = document.createElement("div");
      stopPreview.classList.add('Preview-Stop');
      stopPreview.innerHTML = '<svg fill="#FFFFFF" width="187px" height="187px" viewBox="-5.6 -5.6 67.20 67.20" xmlns="http://www.w3.org/2000/svg" stroke="#FFFFFF"><g id="SVGRepo_bgCarrier" stroke-width="0"><rect x="-5.6" y="-5.6" width="67.20" height="67.20" rx="33.6" fill="#ff0068" strokewidth="0"></rect></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M 27.9999 51.9063 C 41.0546 51.9063 51.9063 41.0781 51.9063 28 C 51.9063 14.9453 41.0312 4.0937 27.9765 4.0937 C 14.8983 4.0937 4.0937 14.9453 4.0937 28 C 4.0937 41.0781 14.9218 51.9063 27.9999 51.9063 Z M 27.9999 47.9219 C 16.9374 47.9219 8.1014 39.0625 8.1014 28 C 8.1014 16.9609 16.9140 8.0781 27.9765 8.0781 C 39.0155 8.0781 47.8983 16.9609 47.9219 28 C 47.9454 39.0625 39.0390 47.9219 27.9999 47.9219 Z M 19.7265 34.0469 C 19.7265 35.4531 20.5702 36.2968 21.9999 36.2968 L 33.9999 36.2968 C 35.4062 36.2968 36.2733 35.4531 36.2733 34.0469 L 36.2733 21.9531 C 36.2733 20.5703 35.4062 19.7266 33.9999 19.7266 L 21.9999 19.7266 C 20.5702 19.7266 19.7265 20.5703 19.7265 21.9531 Z"></path></g></svg>';
      cardContainer.appendChild(trailerVideo);
      cardContainer.appendChild(stopPreview);
      trailerVideo.oncanplay = () => {
        trailerVideo.play();
      };
      const endTrailer = (event) => {
        if (event) event.stopPropagation();
        trailerVideo.pause();
        trailerVideo.src = "";
        trailerVideo.remove();
        cardContainer.classList.remove("Preview-Trailer");
        stopPreview.removeEventListener("click", endTrailer);
        stopPreview.remove();
      };
      stopPreview.addEventListener("click", endTrailer);
      trailerVideo.onended = endTrailer;
    })

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
      if (playItemList.current) {
        playItemList.current.innerHTML = "";

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

          playItemList.current.appendChild(seasonDiv);


        });
      }
    }
    else {
      startPlay(currentView._id);
    }
  }

  function startPlay(contentid) {
    // Fetch Audio And Details First, Then Play

    // set.setMeta({ seriesid: seriesid, seasonid: seasonid, id: contentid });
    // fetch(`/getDetails/${contentid}`)
    //   .then(response => { if (response.ok) return response.json() })    // Throw Error If Not Found
    //   .then(data => {
    //     setDetails(data);
    //     setPlay(true);
    //   })

    set.setMeta({ id: contentid });
    fetch(`http://192.168.0.110:4373/getDetails/${contentid}`)
      .then(response => {
        if (response.ok) return response.json();
        else throw new Error("Media Not Playable");
      })
      .then(data => {
        set.setDetails(data);
        set.setPlay(true);
      }).catch(error => {
        alert(error)
      })
  }

  function scroll(direction) {
    if (direction && horizontalCard.current) {
      horizontalCard.current.scrollLeft += 200;
    }
    else if (horizontalCard.current) {
      horizontalCard.current.scrollLeft -= 200;
    }
  }

  return (
    <React.Fragment>
      <React.Fragment>
        <div className="Background-Image-Container">
        </div>
        <div className="Background-Image-Overlay"></div>
        <Navbar changeTab={set.setTab} />
        <div className="Hero-Interact">
          <div className="Hero-Tags">
          </div>
          <div className="Hero-Image-Heading">
            <div className="Title-Image"></div>
          </div>
          <div className="Hero-Details">
            <div className="Release-Year oxygen-bold"></div>
            <div className="Release-Duration oxygen-bold"></div>
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
              <div className="Arrow-Left" onClick={() => scroll()}><Icon type={"Left"} /></div>
              <div className="Arrow-Right" onClick={scroll}><Icon type={"Left"} /></div>
              <div className="Profile" onClick={() => setAccountSettings(true)}>{rating === '18203' ? <img src="IMG_2785.JPG" /> : <img src="IMG_2784.JPG" />}</div>
            </div>
          </div>
          <div ref={horizontalCard} className="Horizontal-Card">
          </div>
        </div>
      </React.Fragment>
      {splashNegative ? <React.Fragment /> : <Splash />}
      {/* <div ref={playItemList} className="Play-Item-List Over-Block" />  */}
      {accountSettings && <Account rating={rating} setRating={set.setRating} close={() => setAccountSettings(false)} />}
    </React.Fragment>
  )
}

export default Home