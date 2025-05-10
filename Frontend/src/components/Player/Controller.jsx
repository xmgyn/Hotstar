import { useEffect, useState, useContext } from "react";
import { DataContext } from "../../utility";

function Controller({ Props }) {
  const { setPlay } = useContext(DataContext); 

  let controller;
  let video = Props.videoRef.current;
  let audio = Props.audioRef.current;

  const [imagePreview, setImagePreview] = useState(false);

  const setPlayState = () => {
    if (!video) video = Props.videoRef.current;
    if (!audio) audio = Props.audioRef.current;
    if (Props.Play) {
      video.pause();
      audio.pause();
    } else {
      video.play();
      audio.play();
    }
    Props.setPlay(!Props.Play);
  }

  const setSeekState = (seekAhead) => {
    if (!video) video = Props.videoRef.current;
    if (!audio) audio = Props.audioRef.current;
    if (seekAhead) {
      video.currentTime += 10;
      audio.currentTime += 10;
    }
    else {
      video.currentTime -= 10;
      audio.currentTime -= 10;
    }
  }

  const showImagePreview = (duration) => {
    if (controller) {
      controller.abort();
    }
    controller = new AbortController();
    const { signal } = controller;
    const minute = Math.floor(duration / 60);
    fetch(`http://192.168.0.110:4373/streamImage/67eeeac7ca5dc42e95d2f24e/${minute}`, { signal })
      .then(response => response.blob())
      .then(blob => {
        const imgURL = URL.createObjectURL(blob);
        document.getElementById("Image-Preview").src = imgURL;
      })
      .catch(error => {
        if (error.name !== "AbortError") {
          console.error("Error Fetching Image:", error);
        }
      });
  };

  const TimeFormat = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const secs = Math.floor(time % 60);

    return `${hours > 0 ? hours.toString().padStart(2, '0') + ':' : ''}${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  useEffect(() => {
    const seekbarCircle = document.getElementById("Video-Seek-Current");
    const seekbar = document.querySelector(".Video-Seek-Bar");
    const video = Props.videoRef.current;
    const audio = Props.audioRef.current;
    const updateSeekbar = () => {
      if (video) {
        const percentage = (video.currentTime / video.duration) * 100;
        document.documentElement.style.setProperty("--seek-width", Math.floor(percentage) + '%');
      }
    };

    video.addEventListener("timeupdate", updateSeekbar);

    // Drag The Slider
    seekbarCircle.addEventListener("mousedown", (event) => {
      const updateProgress = (e) => {
        setImagePreview(true);
        const rect = seekbar.getBoundingClientRect();
        let percentage = ((e.clientX - rect.left) / rect.width) * 100;
        let percentageFloor = Math.max(0, Math.min(100, Math.round(percentage)));
        document.documentElement.style.setProperty("--seek-width", percentageFloor + '%');
        document.documentElement.style.setProperty("--seek-preview-width", percentageFloor + '%');
        const time = (percentage * video.duration) / 100;
        video.currentTime = time;
        audio.currentTime = time;
        showImagePreview(time);
      };
      document.addEventListener("mousemove", updateProgress);
      document.addEventListener("mouseup", () => {
        setImagePreview(false);
        document.documentElement.style.setProperty("--seek-preview-width", '0%');
        document.removeEventListener("mousemove", updateProgress);
        document.removeEventListener("mouseup", arguments.callee);
      }, { once: true });
    })

    // Random Click On Seekbar
    seekbar.addEventListener("click", (event) => {
      const rect = seekbar.getBoundingClientRect();
      let percentage = ((event.clientX - rect.left) / rect.width) * 100;
      percentage = Math.max(0, Math.min(100, Math.round(percentage)));
      document.documentElement.style.setProperty("--seek-width", percentage + "%");
      const time = (percentage * video.duration) / 100;
      video.currentTime = time;
      audio.currentTime = time;
      document.documentElement.style.setProperty("--seek-preview-width", '0%');
    })

    // Show Preview Line
    seekbar.addEventListener("mouseenter", (event) => {
      const updateProgressPreview = (e) => {
        setImagePreview(true);
        const rect = seekbar.getBoundingClientRect();
        let percentage = ((e.clientX - rect.left) / rect.width) * 100;
        let percentageFloor = Math.max(0, Math.min(100, Math.round(percentage))) + "%";
        document.documentElement.style.setProperty("--seek-preview-width", percentageFloor);
        showImagePreview((percentage * video.duration) / 100);
      };
      seekbar.addEventListener("mousemove", updateProgressPreview);
      seekbar.addEventListener("mouseleave", () => {
        setImagePreview(false);
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

    return () => {
      video.removeEventListener("timeupdate", updateSeekbar);
    };
  }, [])

  return (
    <div id="Controller" >
      <div id="Controller-Top" className="Controller-Top">
        {video && <div className="Video-Current-Time nokora-bold">{!isNaN(video.duration) && TimeFormat(Props.currentTime)}</div>}
        <div id="Video-Seek-Bar" className="Video-Seek-Bar">
          {imagePreview && <div className="Image-Preview">
            <img id="Image-Preview" />
          </div>}
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
          <div className="Extra-Close"  onClick={() => setPlay(false)}><img src="/cross.png" /></div>
        </div>
      </div>
    </div>
  )
}

export default Controller