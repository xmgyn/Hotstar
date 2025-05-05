import React, { useRef, useEffect, useState } from 'react';
import Controller from '../components/Controller';

import './Play.css';

function Play({ id }) {
    const [Play, setPlay] = useState(false); 
    const [Loading, setLoading] = useState(true); 
    const [currentTime, setCurrentTime] = useState(0);

    const videoRef = useRef(null); 

    useEffect(() => {
        const video = videoRef.current;
        const videoSrc = `http://192.168.0.110:4373/play/${id}`;

        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(videoSrc);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => { setLoading(false) });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoSrc;
            video.addEventListener('loadedmetadata', () => {
                setLoading(false);
            });
            video.addEventListener('canplay', () => {
                setLoading(false); 
            });
            
            video.addEventListener('canplaythrough', () => {
                setLoading(false); 
            });
            
        }

        video.addEventListener("playing", () => { setLoading(false) });
        video.addEventListener("seeked", () => { setLoading(false) });
        video.addEventListener("waiting", () => { setLoading(true) });
        video.addEventListener("seeking", () => { setLoading(true) });

        video.addEventListener("timeupdate", () => { setCurrentTime(video.currentTime) });

        return () => {
            if (video && video.canPlayType('application/vnd.apple.mpegurl')) {
                video.removeEventListener('loadedmetadata', () => setLoading(false));
                video.removeEventListener('canplay', () => setLoading(false));
                video.removeEventListener('canplaythrough', () => setLoading(false));
                video.removeEventListener('playing', () => setLoading(false));
                video.removeEventListener('seeked', () => setLoading(false));
                video.removeEventListener('waiting', () => setLoading(false));
                video.removeEventListener('seeking', () => setLoading(false));
            }
        };
    }, [id]);

    return (
        <div className='Play'>
            <video ref={videoRef} id="video" crossOrigin="anonymous">
                <track
                    id="subtitle"
                    kind="subtitles"
                    srclang="en"
                    src={`http://192.168.0.110:4373/chunk/${id}/subtitles_en.vtt`}
                    label="English"
                    default
                />
            </video>
            <Controller Props={{ Loading, Play, setPlay, videoRef, currentTime }} />
        </div>
    );
}

export default Play;