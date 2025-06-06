import React, { Fragment, useRef, useEffect, useState } from 'react';
import { Icon as IconPack, Image as ImagePack } from "./Assets";

function AudioSelect({ Props }) {
  //Props.setAudio();
  return (
    <Fragment>
      <div className="Window">
        <div></div>
        <div className="Audio-Select-Pane">
          {
            Props.details &&
            Props.details.audio_profiles.map(
              (item) => (
                <div className="Audio-Select-Item">
                  <input name="Audio-Select" type="radio" />
                  {item.name}
                </div>
              )
            )
          }
        </div>
        <div></div>
        <div className="Window-Close" onClick={() => Props.setShowAudioSelect(false)}><Close /></div>
        <div></div>
      </div>
    </Fragment>
  )
}


function Controller({ Props }) {
  let controller;
  let video = Props.videoRef.current;
  let audio = Props.audioRef.current;

  const setPlayState = () => {
    if (!video) video = Props.videoRef.current;
    if (!audio) audio = Props.audioRef.current;
    if (Props.PlayVideo) {
      video.pause();
      audio.pause();
    } else {
      video.play();
      audio.play();
    }
    Props.setPlayVideo(!Props.PlayVideo);
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
    document.getElementById("Image-Preview-Cont").innerHTML = '';
    document.getElementById("Image-Preview-Cont").style.setProperty("display", 'flex');
    const { signal } = controller;
    const minute = Math.floor(duration / 60);
    const second = Math.floor(duration % 60);
    if (minute.isNaN) return;
    const img = document.createElement("div");
    img.id = "Image-Preview";
    let value;
    if (second >= 0 && second < 20) {
      value = 1;
    } else if (second >= 20 && second < 40) {
      value = 2;
    } else {
      value = 3; // Covers 40-59 seconds
    }
    fetch(`http://192.168.0.110:4373/streamImage/${Props.meta.id}/${minute <= 0 ? 0 : minute}/${value}`, { signal })
      .then(response => response.blob())
      .then(blob => {
        const imgURL = URL.createObjectURL(blob);
        //img.src = imgURL;
        //img.style.objectPosition = "-200px -100px";
        img.style.background = `url(${imgURL}) 0 -15px`;
        document.getElementById("Image-Preview-Cont").appendChild(img);
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
        const rect = seekbar.getBoundingClientRect();
        let percentage = ((e.clientX - rect.left) / rect.width) * 100;
        let percentageFloor = Math.max(0, Math.min(100, Math.round(percentage)));
        document.documentElement.style.setProperty("--seek-width", percentageFloor + '%');
        const time = (percentage * video.duration) / 100;
        video.currentTime = time;
        audio.currentTime = video.currentTime;
      };
      document.addEventListener("mousemove", updateProgress);
      document.addEventListener("mouseup", () => {
        document.removeEventListener("mousemove", updateProgress);
        document.removeEventListener("mouseup", arguments.callee);
      }, { once: true });
    })

    // Drag The Slider For Touch Devices
    seekbarCircle.addEventListener("touchstart", (event) => {
      const updateProgress = (e) => {
        const rect = seekbar.getBoundingClientRect();
        let touch = e.touches[0]; // Get the first touch point
        let percentage = ((touch.clientX - rect.left) / rect.width) * 100;
        let percentageFloor = Math.max(0, Math.min(100, Math.round(percentage)));
        document.documentElement.style.setProperty("--seek-width", percentageFloor + '%');
        const time = (percentage * video.duration) / 100;
        video.currentTime = time;
        audio.currentTime = video.currentTime;
      };

      document.addEventListener("touchmove", updateProgress);
      document.addEventListener("touchend", () => {
        document.removeEventListener("touchmove", updateProgress);
        document.removeEventListener("touchend", arguments.callee);
      }, { once: true });
    });


    // Random Click On Seekbar
    seekbar.addEventListener("click", (event) => {
      const rect = seekbar.getBoundingClientRect();
      let percentage = ((event.clientX - rect.left) / rect.width) * 100;
      percentage = Math.max(0, Math.min(100, Math.round(percentage)));
      document.documentElement.style.setProperty("--seek-width", percentage + "%");
      const time = (percentage * video.duration) / 100;
      video.currentTime = time;
      audio.currentTime = video.currentTime;
      document.getElementById("Image-Preview-Cont").style.setProperty("display", 'none');
      document.documentElement.style.setProperty("--seek-preview-width", '0%');
    })

    // Show Preview Line
    seekbar.addEventListener("mouseenter", (event) => {
      const updateProgressPreview = (e) => {
        const rect = seekbar.getBoundingClientRect();
        let percentage = ((e.clientX - rect.left) / rect.width) * 100;
        let percentageFloor = Math.max(0, Math.min(100, Math.round(percentage))) + "%";
        document.documentElement.style.setProperty("--seek-preview-width", percentageFloor);
        showImagePreview((percentage * video.duration) / 100);
      };
      seekbar.addEventListener("mousemove", updateProgressPreview);
      seekbar.addEventListener("mouseleave", () => {
        document.getElementById("Image-Preview-Cont").style.setProperty("display", 'none');
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
        {video && <div className="Video-Time nokora-bold">{!isNaN(video.duration) && TimeFormat(Props.currentTime)}</div>}
        <div id="Video-Seek-Bar" className="Video-Seek-Bar">
          <div id="Image-Preview-Cont" className="Image-Preview-Cont">
          </div>
          <div id="Video-Seek-Preview-Line" className="Video-Seek-Preview-Line"></div>
          <div id="Video-Seek-Line" className="Video-Seek-Line"></div>
          <div id="Video-Seek-Current" className="Video-Seek-Current">
            <div id="Seek-Inner-Circle" className="Seek-Inner-Circle"></div>
          </div>
        </div>
        {video && <div className="Video-Time nokora-bold">{!isNaN(video.duration) && TimeFormat(video.duration)}</div>}
      </div>
      <div className="Controller-Bottom">
        <div className="Settings">
          {Props.details.audio_profiles.length > 1 ? <div className="Settings-Audio-Button" onClick={() => Props.setShowAudioSelect(!Props.showAudioSelect)}><ImagePack type="audio" /></div> : <div className="Settings-Audio-Button Settings-Greyed"><ImagePack type="audio_disabled" /></div>}
          {Props.details.subtitle ? <div className="Settings-Subtitle-Button"><ImagePack type="subtitle" /></div> : <div className="Settings-Subtitle-Button Settings-Greyed"><ImagePack type="subtitle_disabled" /></div>}

        </div>
        <div className="Controls">
          <div className="Controls-Previous"><ImagePack type="backward" /></div>
          <div className="Controls-Seek-Back" onClick={() => setSeekState(0)}><ImagePack type="previous" /></div>
          {Props.Loading ? <div className="Controls-Seek-Loading"><ImagePack type="loading" /></div> : <div className="Controls-Seek-Play" onClick={setPlayState}>{Props.PlayVideo ? <ImagePack type="pause" /> : <ImagePack type="play" />}</div>}
          <div className="Controls-Seek-Ahead" onClick={() => setSeekState(1)}><ImagePack type="next" /></div>
          <div className="Controls-Next"><ImagePack type="forward" /></div>
        </div>
        <div className="Extra">
          <div className="Extra-Info-Button" onClick={() => Props.setShowDetails(!Props.showDetails)}><ImagePack type="info" /></div>
          <div className="Extra-Close" onClick={() => Props.setPlay(false)}><ImagePack type="cross" /></div>
        </div>
      </div>
    </div>
  )
}

// function Details({ Props }) {

//   return (
//     <Fragment>
//       <div className="Window">
//         <div className="Details-Pane">{JSON.stringify(details) ?? "We Dont Have Any"}</div>
//         <div className="Window-Close" onClick={() => Props.showDetails(false)}><Close /></div>
//       </div>
//     </Fragment>
//   )
// }

function Play({ meta, details, set: { setPlay } }) {
  console.log(details)
  const [PlayVideo, setPlayVideo] = useState(false);
  const [Loading, setLoading] = useState(true);
  const [Audio, setAudio] = useState(details.audio_profiles[0].type);
  const [currentTime, setCurrentTime] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [showAudioSelect, setShowAudioSelect] = useState(false);

  let Container, Player;

  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    let videoSrc = `http://192.168.0.110:4373/play/${meta.id}/video`;
    let audioSrc = `http://192.168.0.110:4373/play/${meta.id}/${Audio}`;

    if (meta.seriesid) {
      videoSrc = `http://192.168.0.110:4373/play/${meta.id}/video?season_id=${meta.seasonid}&series_id=${meta.seriesid}`;
      audioSrc = `http://192.168.0.110:4373/play/${meta.id}/${Audio}?season_id=${meta.seasonid}&series_id=${meta.seriesid}`;
    }

    Container = document.getElementById("Controller");
    Player = document.getElementById("Player");

    let readystate = 0;
    let timeout;

    document.addEventListener("mousemove", () => {
      clearTimeout(timeout);
      Container.style.opacity = 1;
      Player.style.cursor = "default";
      timeout = setTimeout(() => {
        if (video.paused) return;
        Container.style.opacity = 0;
        Player.style.cursor = "none";
      }, 3000);
    });


    if (Hls.isSupported()) {
      const hlsVideo = new Hls();
      hlsVideo.loadSource(videoSrc);
      hlsVideo.attachMedia(video);

      const hlsAudio = new Hls();
      hlsAudio.loadSource(audioSrc);
      hlsAudio.attachMedia(audio);

      Promise.all([
        new Promise((resolve) => hlsVideo.on(Hls.Events.MANIFEST_PARSED, resolve)),
        new Promise((resolve) => hlsAudio.on(Hls.Events.MANIFEST_PARSED, resolve))
      ]).then(() => {
        setLoading(false);
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSrc;
      audio.src = audioSrc;
      video.addEventListener('loadedmetadata', () => {
        setLoading(false);
      });
      video.addEventListener('canplaythrough', () => {
        setLoading(false);
      });
    }

    video.addEventListener("playing", () => { document.getElementById("Controller").style.opacity = 1; setLoading(false) });
    video.addEventListener("seeked", () => {
      audio.currentTime = video.currentTime;
      readystate++;
      if (readystate > 1) {
        setLoading(false);
        console.log(video.paused)
        if (video.paused) return;
        audio.play();
        video.play();
      }
    });
    audio.addEventListener("seeked", () => {
      readystate++;
      if (readystate > 1) {
        setLoading(false);
        if (video.paused) return;
        audio.play();
        video.play();
      }
    });
    video.addEventListener("waiting", () => { document.getElementById("Controller").style.opacity = 1; setLoading(true) });
    video.addEventListener("seeking", () => {
      setLoading(true);
      audio.pause();
      video.pause();
      readystate = 0;
    });
    video.addEventListener("timeupdate", () => {
      setCurrentTime(video.currentTime);
    });

    return () => {
      if (video && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.removeEventListener('loadedmetadata', () => setLoading(false));
        video.removeEventListener('canplaythrough', () => setLoading(false));
        video.removeEventListener('playing', () => setLoading(false));
        video.removeEventListener('seeked', () => setLoading(false));
        video.removeEventListener('waiting', () => setLoading(false));
        video.removeEventListener('seeking', () => setLoading(false));
      }

      document.documentElement.style.setProperty("--seek-width", '0%');
    };
  }, [meta, Audio]);

  return (
    <div id="Player" className='Player'>
      <div className="Play">
        <video ref={videoRef} id="video" crossOrigin="anonymous"></video>
        <audio ref={audioRef} id="audio" crossOrigin="anonymous"></audio>
        <Controller Props={{ meta, details, Loading, PlayVideo, setPlayVideo, setPlay, videoRef, audioRef, currentTime, showDetails, setShowDetails, showAudioSelect, setShowAudioSelect }} />
      </div>
      {(showDetails || showAudioSelect) &&
        <div className="Overlay">
          {/* {showDetails && <Details Props={{ setShowDetails }} />} */}
          {showAudioSelect && <AudioSelect Props={{ details, setShowAudioSelect, setAudio }} />}
        </div>}
    </div>
  );
}

export default Play;

{/* <track
                        id="subtitle"
                        kind="subtitles"
                        srclang="en"
                        src={`http://192.168.0.110:4373/getSubtitle/${id}`}
                        label="English"
                        default
                    /> */}