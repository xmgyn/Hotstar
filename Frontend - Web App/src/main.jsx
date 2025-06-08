import { StrictMode, useState } from 'react';
import { Fragment, useEffect, useRef } from "react";
import { createRoot } from 'react-dom/client';

import Home from './Home';
import Play from './Play';

import './index.css';

function Message(type, msg) {
  return (
    <div>{msg}</div>
  )
}

function Main() {
  // Universal Data
  const [data, setData] = useState(null);
  const [message, setMessage] = useState(null);

  // Home Page
  const [splashNegative, setSplashNegative] = useState(false);
  const [context, setContext] = useState(null);
  const [rating, setRating] = useState('18203');
  const [tab, setTab] = useState("Home");

  // Player Page
  const [play, setPlay] = useState(false);
  const [details, setDetails] = useState(null);
  const [meta, setMeta] = useState();

  useEffect(() => {
    const fetchData = async () => {
      if (rating !== '' && rating !== '18203') return;
      setSplashNegative(false);
      try {
        const response = await fetch(__PROXY__ + `/getCollections/${(tab != "Home") ? tab : "All"}${(rating) ? '?rating=' + rating : ''}`);
        const result = await response.json();
        const shuffledResult = result.sort(() => Math.random() - 0.5);
        setData(shuffledResult);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();

    document.addEventListener('touchmove', function (event) {
      if (event.scale !== 1) { event.preventDefault(); }
    }, { passive: false });
  }, [tab, rating]);

  return (
    <Fragment>
      <div style={{ display: play ? "none" : "block" }}>
        <Home cardData={data} currentView={context} splashNegative={splashNegative} tab={tab} rating={rating} set={{ setContext, setPlay, setTab, setMeta, setDetails, setSplashNegative, setRating, setMessage }} />
      </div>
      {play && <Play key={context._id} meta={meta} details={details} set={{ setPlay }} />}
    </Fragment>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Main />
  </StrictMode>,
)
