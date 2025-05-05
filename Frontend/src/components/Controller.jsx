import { useState } from "react";

function Controller({ Props }) {
  const video = Props.videoRef.current;

  const setPlayState = () => {
    if (Props.Play) {
      video.pause();
    } else {
      video.play();
    }
    Props.setPlay(!Props.Play);
  }

  const setSeekState = (seekAhead) => {
    if (seekAhead) {
      video.currentTime += 10;
    }
    else {
      video.currentTime -= 10;
    }
  }

  const TimeFormat = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const secs = Math.floor(time % 60);

    return `${hours > 0 ? hours.toString().padStart(2, '0') + ':' : ''}${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div id="Controller" >
      <div className="Controller-Top">
        {video && <div className="Video-Current-Time nokora-bold">{TimeFormat(Props.currentTime)}</div>}
        <div className="Video-Seek-Bar">
          <div className="Video-Seek-Line"></div>
          <div className="Video-Seek-Current"></div>
        </div>
        {video && <div className="Video-Total-Time nokora-bold">{TimeFormat(video.duration ?? 0)}</div>}
      </div>
      <div className="Controller-Bottom">
        <div className="Settings">
          <div className="Settings-Audio-Button"><img src="/airplay.png" /></div>
          <div className="Settings-Subtitle-Button"><img src="/subtitles.png" /></div>
        </div>
        <div className="Controls">
          <div className="Controls-Previous"><img src="/left-arrow.png" /></div>
          <div className="Controls-Seek-Back" onClick={() => setSeekState(0)}><img src="/previous.png" /></div>
          {Props.Loading ? <div className="Controls-Seek-Loading"><img src="/play-loading.png" /></div> : <div className="Controls-Seek-Play" onClick={setPlayState}>{Props.Play ? <img src="/pause.png" /> : <img src="/play.png" />}</div>}
          <div className="Controls-Seek-Ahead" onClick={() => setSeekState(1)}><img src="/next.png" /></div>
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