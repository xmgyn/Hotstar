import { StrictMode, useState } from 'react'
import React, { useEffect, useRef } from "react";
import { createRoot } from 'react-dom/client'

import Home from './Home'
import Play from './Play'

import './index.css'

function Main() {
  // Universal Data
  const [data, setData] = useState(null);
  
  // Home Page
  const [context, setContext] = useState(null);
  const [tab, setTab] = useState("All");

  // Player Page
  const [details, setDetails] = useState(null);
  const [play, setPlay] = useState(false);
  
  const [meta, setMeta] = useState();

  const backgroundImageContainer = document.querySelector('div.Background-Image-Container');
  const iconImageContainer = document.querySelector('div.Title-Image');
  const tagsContainer = document.querySelector('div.Hero-Tags');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/getCollections/${(tab != "Home") ? tab : "All"}?rating=18203`);
        const result = await response.json();
        const shuffledResult = result.sort(() => Math.random() - 0.5);
        setData(shuffledResult);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [tab]);

  return (
    <React.Fragment>
      <div style={{ display: play ? "none" : "block" }}>
        <Home Props={{ data, context, setPlay, setMeta, setDetails }}/>
      </div>
      {play && <Play key={context._id} meta={meta} />}
    </React.Fragment>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Main />
  </StrictMode>,
)
