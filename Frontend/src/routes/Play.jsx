import React, { useRef, useEffect, useState } from 'react';

import Controller from '../components/Player/Controller';
import Details from '../components/Player/Details';
import AudioSelect from '../components/Player/AudioSelect';

import './Play.css';

function Play({ id }) {
    const [Play, setPlay] = useState(false);
    const [Loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [showDetails, setShowDetails] = useState(false);
    const [showAudioSelect, setShowAudioSelect] = useState(false);

    const videoRef = useRef(null);
    const audioRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        const audio = audioRef.current;

        const videoSrc = `http://192.168.0.110:4373/play/${id}/video`;
        const audioSrc = `http://192.168.0.110:4373/play/${id}/audio_hindi`;

        const Container = document.getElementById("Controller");
        const Player = document.getElementById("Player");

        let timeout;

        document.addEventListener("mousemove", () => {
            clearTimeout(timeout); // Reset timer
            Container.style.display = "flex"; // Show controls
            Player.style.cursor = "default";
            // Hide controls after 2 seconds of inactivity
            timeout = setTimeout(() => {
                if (video.paused) return;
                Container.style.display = "none"; // Hide controls
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

        video.addEventListener("playing", () => { setLoading(false) });
        video.addEventListener("seeked", () => {
            audio.currentTime = video.currentTime;
            setLoading(false);
        });
        video.addEventListener("waiting", () => { setLoading(true) });
        video.addEventListener("seeking", () => {
            setLoading(true);
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
    }, [id]);

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
                <Controller Props={{ id, Loading, Play, setPlay, videoRef, audioRef, currentTime, showDetails, setShowDetails, showAudioSelect, setShowAudioSelect }} />
            </div>
            {(showDetails || showAudioSelect) &&
                <div className="Overlay">
                    {showDetails && <Details />}
                    {showAudioSelect && <AudioSelect />}
                </div>}
        </div>
    );
}

export default Play;