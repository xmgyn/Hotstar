import { useEffect, useState } from "react";

function Controller({ Props }) {
  const [seekPosition, setSeekPosition] = useState(0);


  let video = Props.videoRef.current;

  const setPlayState = () => {
    if (!video) video = Props.videoRef.current;
    if (Props.Play) {
      video.pause();
    } else {
      video.play();
    }
    Props.setPlay(!Props.Play);
  }

  const setSeekState = (seekAhead) => {
    if (!video) video = Props.videoRef.current;
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

  useEffect(() => {
    const seekbarCircle = document.getElementById("Video-Seek-Current");
    const seekbar = document.querySelector(".Video-Seek-Bar");
    const video = videoRef.current;
    
    const updateSeekbar = () => {
      if (video) {
        const percentage = (video.currentTime / video.duration) * 100;
        setSeekPosition(percentage);
      }
    };

    video.addEventListener("timeupdate", updateSeekbar);

    return () => {
      video.removeEventListener("timeupdate", updateSeekbar);
    };

    // Drag The Slider
    seekbarCircle.addEventListener("mousedown", (event) => {
      const updateProgress = (e) => {
        const rect = seekbar.getBoundingClientRect();
        let percentage = ((e.clientX - rect.left) / rect.width) * 100;
        percentage = Math.max(0, Math.min(100, Math.round(percentage))) + "%";
        document.documentElement.style.setProperty("--seek-width", percentage);
      };
      document.addEventListener("mousemove", updateProgress);
      document.addEventListener("mouseup", () => {
        document.removeEventListener("mousemove", updateProgress);
        document.removeEventListener("mouseup", arguments.callee);
      }, { once: true });
    })

    // Random Click On Seekbar
    seekbar.addEventListener("click", (event) => {
      const rect = seekbar.getBoundingClientRect();
      let percentage = ((event.clientX - rect.left) / rect.width) * 100;
      percentage = Math.max(0, Math.min(100, Math.round(percentage))) + "%";
      document.documentElement.style.setProperty("--seek-width", percentage);
      document.documentElement.style.setProperty("--seek-preview-width", '0%');
    })
    
    // Show Preview Line
    seekbar.addEventListener("mouseenter", (event) => {
      const updateProgressPreview = (e) => {
        const rect = seekbar.getBoundingClientRect();
        let percentage = ((e.clientX - rect.left) / rect.width) * 100;
        percentage = Math.max(0, Math.min(100, Math.round(percentage))) + "%";
        document.documentElement.style.setProperty("--seek-preview-width", percentage);
      };
      seekbar.addEventListener("mousemove", updateProgressPreview);
      seekbar.addEventListener("mouseleave", () => {
        document.documentElement.style.setProperty("--seek-preview-width", '0%');
        seekbar.removeEventListener("mousemove", updateProgressPreview);
      }, { once: true });
    })

    document.addEventListener('keydown', (event) => {
      switch (event.code) {
        case "Space":
          setPlayState();
          break;
        case "ArrowLeft":
          setSeekState(0);
          break;
        case "ArrowRight":
          setSeekState(1);
          break;
      }
    })
  }, [])

  return (
    <div id="Controller" >
      <div id="Controller-Top" className="Controller-Top">
        {video && <div className="Video-Current-Time nokora-bold">{!isNaN(video.duration) && TimeFormat(Props.currentTime)}</div>}
        <div id="Video-Seek-Bar" className="Video-Seek-Bar">
          <div id="Video-Seek-Preview-Line" className="Video-Seek-Preview-Line"></div>
          <div id="Video-Seek-Line" className="Video-Seek-Line"></div>
          <div id="Video-Seek-Current" className="Video-Seek-Current">
            <div id="Seek-Inner-Circle" className="Seek-Inner-Circle"></div>
          </div>
        </div>
        {video && <div className="Video-Total-Time nokora-bold">{!isNaN(video.duration) && TimeFormat(video.duration)}</div>}
      </div>
      <div className="Controller-Bottom">
        <div className="Settings">
          <div className="Settings-Audio-Button" onClick={() => Props.setShowAudioSelect(!Props.showAudioSelect)}><img src="/audio.png" /></div>
          <div className="Settings-Subtitle-Button"><img src="/subtitles.png" /></div>
        </div>
        <div className="Controls">
          <div className="Controls-Previous"><img src="/backward.png" /></div>
          <div className="Controls-Seek-Back" onClick={() => setSeekState(0)}><img src="/previous.png" /></div>
          {Props.Loading ? <div className="Controls-Seek-Loading"><img src="/play-loading.png" /></div> : <div className="Controls-Seek-Play" onClick={setPlayState}>{Props.Play ? <img src="/pause.png" /> : <img src="/play.png" />}</div>}
          <div className="Controls-Seek-Ahead" onClick={() => setSeekState(1)}><img src="/next.png" /></div>
          <div className="Controls-Next"><img src="/forward.png" /></div>
        </div>
        <div className="Extra">
          <div className="Extra-Info-Button" onClick={() => Props.setShowDetails(!Props.showDetails)}><img src="/about.png" /></div>
          <div className="Extra-Close"><img src="/cross.png" /></div>
        </div>
      </div>
    </div>
  )
}

export default Controller