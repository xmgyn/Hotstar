import { Fragment, useEffect, useRef, useState } from "react";

import { Icon as IconPack, Image as ImagePack } from "./Assets";

// Complete
async function CardBlob(id) {
  const urls = {
    cardImg: __PROXY__ + `/getCard/${id}`,
    iconImg: __PROXY__ + `/getIcon/${id}`,
    previewImg: __PROXY__ + `/getPreview/${id}`,
    backgroundImg: __PROXY__ + `/getBackground/${id}`,
  };

  const fetchBlob = async (url) => {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  };

  const blobs = await Promise.all(
    Object.keys(urls).map(async (key) => ({ [key]: await fetchBlob(urls[key]) }))
  );

  return Object.assign({}, ...blobs);
}

// Complete
function Splash() {
  return (
    <Fragment>
      <div className="Splash">
        <div className="Splash-Element">
          <ImagePack type={"logo"} />
          <span className="Splash-Loader"></span>
        </div>
      </div>
    </Fragment>
  )
}

function Settings() {
  return (
    <Fragment>
      <div>Profile</div>
      <div>Preferrence</div>
      <div>Sessions</div>
    </Fragment>
  )
}

function About() {
  return (
    <Fragment>
      <div>Legal Disclaimer</div>
      <div>
        This project, Hotstar, is an independent, open-source initiative made and hosted on GitHub by Mrigayan. It is not affiliated with, endorsed by, or associated with JioHotstar, Disney+ Hotstar, or any official streaming services.

        This application is purely for educational and non-commercial purposes. The content provided through this project is not officially licensed, and users should ensure compliance with copyright laws applicable in their respective regions.

        The developers of this project do not claim ownership of any movie or media content accessed through this application and bear no responsibility for its usage.
      </div>
      <div>
        The domain hotstar.site is owned as part of this open-source project and is not an instance of typosquatting. Should an official request from Hotstar be made, the domain may be handed over accordingly.
      </div>
      <div>All icons used in this project are sourced from SVG Repo(svgrepo.com).</div>
    </Fragment>
  )
}

function Login() {
  return (
    <Fragment>
      <div>Settings</div>
      <div>Download The App</div>
      <div>About</div>
      <div>Logout</div>
    </Fragment>
  )
}

// Complete
function Navbar({ changeTab }) {
  const shift = (event) => {
    const navActive = document.querySelector("div.Nav-Active");
    if (navActive) navActive.classList.remove('Nav-Active');
    event.target.classList.add('Nav-Active');
    document.title = 'Hotstar';
    changeTab(event.target.firstChild.data);
  }

  return (
    <div className="Navbar">
      <div className="Nav-Left">
        <div className="Nav-Item oxygen-bold Nav-Blurred" onClick={shift}>Resume</div>
        <div className="Nav-Item Nav-Active oxygen-bold" onClick={shift}>Home</div>
        <div className="Nav-Item oxygen-bold" onClick={shift}>Movies</div>
        <div className="Nav-Item oxygen-bold" onClick={shift}>Series</div>
        <div className="Nav-Item oxygen-bold" onClick={shift}>Favourites</div>
      </div>
      <div className="Nav-Right">
        <div className="Search">
          <IconPack type="search" />
        </div>
        <div className="Nav-Login"></div>
      </div>
    </div>
  )
}

function Account({ rating, close, setRating }) {
  const [inputValue, SetInputValue] = useState(rating);

  const LogsList = useRef(null);

  useEffect(function () {
    fetch(__PROXY__ + `/logs`).then(data => {
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
    <Fragment>
      <div className="Background-Image-Overlay Extra-Overlay">
        <div onClick={() => { setRating(inputValue); close(); }}>
          <IconPack type={"PopUpClose"} />
        </div>
      </div>
      <div className="Developer-Settings Over-Block">
        <div className="Hoster-Details">
          <div className="Hoster-Image"><ImagePack type="profile_rated" /></div>
          <div className="Hoster-Name oxygen-regular">Axon-9</div>
          <div className="Hoster-Detail oxygen-regular">24 Movies + 3 Series</div>
          <div className="Hoster-Code oxygen-regular">
            <input value={inputValue} placeholder="Enter Developers Code" onChange={(e) => SetInputValue(e.target.value)} />
          </div>
        </div>

        <div className="Developer-Server"></div>
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
    </Fragment>
  )
}

function Home({ cardData, currentView, rating, tab, splashNegative, set }) {
  const [accountSettings, setAccountSettings] = useState(false);
  const [playListItemShow, setPlayListItemShow] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [firstRun, setFirstRun] = useState(false);
  const [paginatedData, setPaginatedData] = useState(null);
  const horizontalCard = useRef(null);
  const playItemList = useRef(null);
  const lastCardRef = useRef(null);

  let cardContainer;

  const fetchControllerRef = useRef(new AbortController());

  useEffect(() => {
    if (!cardData) return;
    setFirstRun(false);
    console.log("Carddata : " + firstRun);
    setPagination({ startIndex: 0, lastIndex: (cardData.length < 8) ? cardData.length : 8 });
  }, [cardData])

  useEffect(() => {
    if (!cardData) return;
    setPaginatedData(cardData.slice(pagination.startIndex, pagination.lastIndex));
    console.log(pagination.startIndex + " " + pagination.lastIndex);
  }, [pagination])

  useEffect(() => {
    if (!paginatedData) return;
    const abortController = new AbortController();
    const signal = abortController.signal;
    console.log("Paginate data : " + firstRun);
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPagination({ startIndex: pagination.lastIndex, lastIndex: (cardData.length < pagination.lastIndex + 5) ? cardData.length : pagination.lastIndex + 5 });
      }
    },
      { rootMargin: "100px" }
    );

    async function LoadCard() {
      if (signal.aborted) return;
      // Fetch All Image And Prepare Blob URLs
      await Promise.all(
        paginatedData.map(async (item, index) => {
          try {
            const blob = await CardBlob(item._id);
            Object.assign(paginatedData[index], blob);
          } catch (error) {
            Object.assign(paginatedData[index], { cardImg: null, iconImg: null, previewImg: null, backgroundImg: null });
          }
        })
      );
      if (signal.aborted) return;
      // Prepare The Cards
      const horizontalCardElements = [];
      const imageElements = paginatedData.map((item) => {
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
      if (signal.aborted) return;
      if (horizontalCard.current) {
        if (!firstRun) horizontalCard.current.innerHTML = "";
        else {
          horizontalCard.current.lastChild.remove();
        }
        horizontalCardElements.forEach(card => horizontalCard.current.appendChild(card));
        if (pagination.lastIndex < cardData.length) {
          const lastCard = document.createElement("div");
          lastCard.classList.add('More-Fetch');
          lastCard.innerHTML = '<span class="Card-Loader"></span>';
          horizontalCard.current.appendChild(lastCard);
          lastCardRef.current = lastCard;
          observer.observe(lastCardRef.current);
        } else {
          horizontalCard.current.lastChild.classList.add('End-Card');
        }

        if (!firstRun) CardSelect(paginatedData[0]);
      }
      if (signal.aborted) return;
      if (!firstRun) {
        document.title = `${tab} | Hotstar`;
        set.setSplashNegative(true);
      }
      setFirstRun(true);
    }
    LoadCard();

    return () => {
      // abortController.abort();

      // Stop Intersection Observer
      //   if (lastCardRef.current) {
      //     observer.unobserve(lastCardRef.current);
      //     lastCardRef.current.remove();
      //     lastCardRef.current = null;
      //   }

      //   // Cleanup Fetch Requests
      //   if (fetchController) {
      //     fetchController.abort();
      //     fetchController = null;
      //   }

      //   // Cleanup Object URLs for images
      //   paginatedData.forEach((item) => {
      //     if (item.cardImg) URL.revokeObjectURL(item.cardImg);
      //     if (item.iconImg) URL.revokeObjectURL(item.iconImg);
      //     if (item.previewImg) URL.revokeObjectURL(item.previewImg);
      //     if (item.backgroundImg) URL.revokeObjectURL(item.backgroundImg);
      //   });

      //   // Remove dynamically added cards
      //   if (horizontalCard.current) {
      //     horizontalCard.current.innerHTML = "";
      //   }

      //   // Reset FirstRun State
      //   setFirstRun(false);
    };

  }, [paginatedData]);

  // Completed
  function CardSelect(content) {
    const prevSelect = document.querySelector('div.Preview-Card');
    if (prevSelect) {
      if (prevSelect.id === content._id) return;
      prevSelect.classList.remove('Preview-Card');
      while (prevSelect.children.length > 1) prevSelect.removeChild(prevSelect.children[1]);
    }

    if (fetchControllerRef.current) fetchControllerRef.current.abort();
    fetchControllerRef.current = new AbortController();
    const { signal } = fetchControllerRef.current;

    const trailerView = document.querySelector('div.Preview-Trailer');
    if (trailerView) trailerView.classList.remove('Preview-Trailer');

    cardContainer = document.getElementById(content._id);

    const previewImage = document.createElement("img");
    previewImage.src = content.previewImg;
    cardContainer.classList.add('Preview-Card');
    cardContainer.appendChild(previewImage);

    const backgroundImageContainer = document.querySelector('div.Background-Image-Container');
    const iconImageContainer = document.querySelector('div.Title-Image');
    const tagsContainer = document.querySelector('div.Hero-Tags');
    const year = document.querySelector('div.Release-Year');
    const duration = document.querySelector('div.Release-Duration');

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

    fetch(__PROXY__ + `/getTrailer/${content._id}`, { signal }).then(data => {
      if (data.status === 200) return data.blob();
      else return;
    }).then(response => {
      if (!response || signal.aborted) return;
      const trailerVideo = document.createElement("video");
      trailerVideo.src = URL.createObjectURL(response);
      cardContainer.classList.add('Preview-Trailer');
      const stopPreview = document.createElement("div");
      stopPreview.classList.add('Preview-Stop');
      const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svgElement.setAttribute("fill", "#FFFFFF");
      svgElement.setAttribute("width", "187px");
      svgElement.setAttribute("height", "187px");
      svgElement.setAttribute("viewBox", "-5.6 -5.6 67.20 67.20");
      svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      svgElement.setAttribute("stroke", "#FFFFFF");
      const bgCarrier = document.createElementNS("http://www.w3.org/2000/svg", "g");
      bgCarrier.setAttribute("id", "SVGRepo_bgCarrier");
      bgCarrier.setAttribute("stroke-width", "0");
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", "-5.6");
      rect.setAttribute("y", "-5.6");
      rect.setAttribute("width", "67.20");
      rect.setAttribute("height", "67.20");
      rect.setAttribute("rx", "33.6");
      rect.setAttribute("fill", "#ff0068");
      rect.setAttribute("stroke-width", "0");
      bgCarrier.appendChild(rect);
      const iconCarrier = document.createElementNS("http://www.w3.org/2000/svg", "g");
      iconCarrier.setAttribute("id", "SVGRepo_iconCarrier");
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute(
        "d",
        "M 27.9999 51.9063 C 41.0546 51.9063 51.9063 41.0781 51.9063 28 C 51.9063 14.9453 41.0312 4.0937 27.9765 4.0937 C 14.8983 4.0937 4.0937 14.9453 4.0937 28 C 4.0937 41.0781 14.9218 51.9063 27.9999 51.9063 Z M 27.9999 47.9219 C 16.9374 47.9219 8.1014 39.0625 8.1014 28 C 8.1014 16.9609 16.9140 8.0781 27.9765 8.0781 C 39.0155 8.0781 47.8983 16.9609 47.9219 28 C 47.9454 39.0625 39.0390 47.9219 27.9999 47.9219 Z M 19.7265 34.0469 C 19.7265 35.4531 20.5702 36.2968 21.9999 36.2968 L 33.9999 36.2968 C 35.4062 36.2968 36.2733 35.4531 36.2733 34.0469 L 36.2733 21.9531 C 36.2733 20.5703 35.4062 19.7266 33.9999 19.7266 L 21.9999 19.7266 C 20.5702 19.7266 19.7265 20.5703 19.7265 21.9531 Z"
      );
      iconCarrier.appendChild(path);
      svgElement.appendChild(bgCarrier);
      svgElement.appendChild(iconCarrier);
      stopPreview.appendChild(svgElement);
      if (signal.aborted) return;
      cardContainer.appendChild(trailerVideo);
      cardContainer.appendChild(stopPreview);
      trailerVideo.oncanplay = () => {
        trailerVideo.play();
      };
      const endTrailer = (event) => {
        if (event) event.stopPropagation();
        trailerVideo.pause();
        URL.revokeObjectURL(trailerVideo.src);
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

  // Completed
  function setFavourite() {
    fetch(`http://192.168.0.110:4373/setFavourite/${currentView._id}`).then(data => {
      if (data.status === 200) {
        set.setContext({ ...currentView, Favourite: !currentView.Favourite });
        set.setMessage({ type: "success", message: `You Liked ${currentView.Name}` })
      }
      else throw new Error("Server Did Not Accept Your Request");
    }).catch(error => { set.setMessage({ type: "error", message: `Setting Favourite Failed : ${error}` }) })
  }

  // Completed
  function getFavourite() {
    return currentView.Favourite ? "#fb0505" : "#00000000";
  }

  function preparePlay() {
    if (fetchControllerRef.current) fetchControllerRef.current.abort();
    const trailerVideo = document.querySelector('div.Preview-Trailer video');
    const stopPreview = document.querySelector('div.Preview-Stop');
    cardContainer = document.querySelector('div.Preview-Card');
    if (trailerVideo) {
      trailerVideo.pause();
      URL.revokeObjectURL(trailerVideo.src);
      trailerVideo.src = "";
      trailerVideo.remove();
    }
    if (stopPreview) {
      stopPreview.remove();
    }

    cardContainer.classList.remove("Preview-Trailer");


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

  // Completed
  function scroll(direction) {
    if (direction && horizontalCard.current) {
      horizontalCard.current.scrollLeft += 200;
    }
    else if (horizontalCard.current) {
      horizontalCard.current.scrollLeft -= 200;
    }
  }

  return (
    <Fragment>
      <Fragment>
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
                <IconPack type={"WatchNow"} />
                <div className="oxygen-regular">Start Watching</div>
              </div>
            </div>
            {currentView && <div className="Hero-Favourite" onClick={setFavourite}><IconPack type={"Like"} fill={getFavourite(currentView)} /></div>}
          </div>
        </div>
        <div className="Play-List">
          <div className="Card-Heading">
            <div className="Text-Heading oxygen-bold">Collections</div>
            <div className="Navigate">
              <div className="Arrow-Left" onClick={() => scroll()}><IconPack type={"Left"} /></div>
              <div className="Arrow-Right" onClick={scroll}><IconPack type={"Left"} /></div>
              <div className="Profile" onClick={() => setAccountSettings(true)}>{rating === '18203' ? <ImagePack type="profile_rated" /> : <img src="IMG_2784.JPG" />}</div>
            </div>
          </div>
          <div ref={horizontalCard} className="Horizontal-Card">
          </div>
        </div>
      </Fragment>
      {splashNegative ? <Fragment /> : <Splash />}
      {playListItemShow && <div ref={playItemList} className="Play-Item-List Over-Block" />}
      {accountSettings && <Account rating={rating} setRating={set.setRating} close={() => setAccountSettings(false)} />}
    </Fragment>
  )
}

export default Home