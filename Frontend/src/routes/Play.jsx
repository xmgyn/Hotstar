import React, { useRef, useEffect, useState, useContext } from 'react';

import { DataContext } from '../utility';

import Controller from '../components/Player/Controller';
import Details from '../components/Player/Details';
import AudioSelect from '../components/Player/AudioSelect';

import './Play.css';

function Play({ meta }) {
    const { details } = useContext(DataContext);

    const [Play, setPlay] = useState(false);
    const [Loading, setLoading] = useState(true);
    const [Audio, setAudio] = useState(details.audio_profiles[0].type);
    const [currentTime, setCurrentTime] = useState(0);
    const [showDetails, setShowDetails] = useState(false);
    const [showAudioSelect, setShowAudioSelect] = useState(false);

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

        const Container = document.getElementById("Controller");
        const Player = document.getElementById("Player");

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
                audio.play();
                video.play();
            }
        });
        audio.addEventListener("seeked", () => {
            readystate++;
            if (readystate > 1) {
                setLoading(false);
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
                <video ref={videoRef} id="video" crossOrigin="anonymous">
                    {/* <track
                        id="subtitle"
                        kind="subtitles"
                        srclang="en"
                        src={`http://192.168.0.110:4373/getSubtitle/${id}`}
                        label="English"
                        default
                    /> */}
                </video>
                <audio ref={audioRef} id="audio" crossOrigin="anonymous">
                </audio>
                <Controller Props={{ meta, Loading, Play, setPlay, videoRef, audioRef, currentTime, showDetails, setShowDetails, showAudioSelect, setShowAudioSelect }} />
            </div>
            {(showDetails || showAudioSelect) &&
                <div className="Overlay">
                    {showDetails && <Details Props={{ setShowDetails }} />}
                    {showAudioSelect && <AudioSelect Props={{ details, setShowAudioSelect, setAudio }} />}
                </div>}
        </div>
    );
}

export default Play;