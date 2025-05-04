function Controller() {
  return (
    <div id="Controller" >
      <div className="Controller-Top">
        <div className="Video-Current-Time oxygen-regular">26:00</div>
        <div className="Video-Seek-Bar">
          <div className="Video-Seek-Current"></div>
        </div>
        <div className="Video-Total-Time oxygen-regular">1:32:00</div>
      </div>
      <div className="Controller-Bottom">
        <div className="Settings">
          <div className="Settings-Audio-Button"><img src="/airplay.png" /></div>
          <div className="Settings-Subtitle-Button"><img src="/subtitles.png" /></div>
        </div>
        <div className="Controls">
          <div className="Controls-Previous"><img src="/left-arrow.png" /></div>
          <div className="Controls-Seek-Back"><img src="/previous.png" /></div>
          <div className="Controls-Seek-Play"><img src="/play.png" /></div>
          <div className="Controls-Seek-Pause"><img src="/pause.png" /></div>
          <div className="Controls-Seek-Ahead"><img src="/next.png" /></div>
          <div className="Controls-Next"><img src="/forward.png" /></div>
        </div>
        <div className="Extra">
          <div className="Extra-Info-Button"><img src="/info.png" /></div>
          <div className="Extra-Close"><img src="/stop.png" /></div>
        </div>
      </div>
    </div>
  )
}

export default Controller