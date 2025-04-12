import List from '../components/List'
import Navbar from '../components/Navbar'
import Like from '../assets/Like'

import './Home.css'
import Play from '../assets/Play'

function Home() {

  return (
    <>
      <div className="Hero-Image-Container">
        <img src="/raya.jpg" style={{ height: '100%' }} />
      </div>
      <div className="Hero-Image-Overlay"></div>
      <Navbar />
      <div className="Hero-Interact">
        <div className="Hero-Tags">
          <div className="Tag oxygen-regular">Animation</div>
          <div className="Tag oxygen-regular">60 FPS</div>
          <div className="Tag oxygen-regular">Adventure</div>
        </div>
        <div className="Hero-Image-Heading">
          <div className="Title-Image"><img src="pngaaa.com-2369863.png" /></div>
        </div>
        <div className="Interact">
          <div className="Hero-Play-Button">
            <Play />
            <div className="oxygen-regular">Start Watching</div>
          </div>
          <div className="Hero-Favourite"><Like /></div>
        </div>
      </div>
      <List className="Play-List"/>
    </>
  )
}

export default Home
