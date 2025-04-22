import React, { useRef, useEffect } from 'react';
import Controller from '../components/Controller';

import './Play.css';

function Play({ id }) {
    const videoRef = useRef(null); 

    useEffect(() => {
        const video = videoRef.current;
        const videoSrc = `http://192.168.0.110:4373/play/${id}`;

        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(videoSrc);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play();
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoSrc;
            video.addEventListener('loadedmetadata', () => {
                video.play();
            });
        }

        return () => {
            if (video && video.canPlayType('application/vnd.apple.mpegurl')) {
                video.removeEventListener('loadedmetadata', () => video.play());
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
            <Controller />
        </div>
    );
}

export default Play;