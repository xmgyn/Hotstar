import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { DataProvider, DataContext } from "./utility";
import React, { useEffect, useRef, useContext } from "react";
import Home from './routes/Home'
import Play from './routes/Play'

function Main() {
  const { play, context } = useContext(DataContext); 
  return (
    <React.Fragment>
      {/* {play ? <Play id={context.id}/> : <Home />} */}

      <Play key='68031c71b32282a3a6e2993e' id='68031c71b32282a3a6e2993e'/>
    </React.Fragment>
  )
}



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DataProvider>
      <Main />
    </DataProvider>
  </StrictMode>,
)
