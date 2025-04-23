import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { DataProvider } from "./utility";
import Home from './routes/Home'
import Play from './routes/Play'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DataProvider>
      {/* <Play id='67eeeac7ca5dc42e95d2f24e'/> */}
      <Home />
    </DataProvider>
    
  </StrictMode>,
)
