import '../App.css';
import AppStoreButtons from "./AppStoreButtons"
import { useEffect, useRef, useState } from 'react';

function Welcome(props) {
    const videoRef = useRef(null);
    const [poster, setPoster] = useState('');

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const captureFrame = () => {
            // Seek to the 10th frame (assuming 30fps, 10 frames ≈ 0.33 seconds)
            video.currentTime = 10 / 30;
        };

        const generatePoster = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const posterUrl = canvas.toDataURL('image/jpeg');
            setPoster(posterUrl);
            video.currentTime = 0; // Reset to start
        };

        video.addEventListener('loadedmetadata', captureFrame);
        video.addEventListener('seeked', generatePoster, { once: true });

        return () => {
            video.removeEventListener('loadedmetadata', captureFrame);
            video.removeEventListener('seeked', generatePoster);
        };
    }, []);

    return (
        <div className="welcome-container">
            <a href="#" onClick={() => props.setShowPage("MAP")}>
                <img
                    className="welcome-logo"
                    src={`${process.env.REACT_APP_IMAGE_SERVER_URL}skatecreteordiedeck.png`}
                    alt="skatecreteordie deck logo"
                />
            </a>
            <h1>Skatepark Map</h1>
            <h1>(tap truck)</h1>
            <h2>Download app for best experience.</h2>
            <AppStoreButtons />
            <h2></h2>
            <div className="welcome-text">
                <p>
                    precisely find a good skatepark near you
                </p>
                <p>
                    track your lines
                </p>
                <p>
                    free, ad free, registration free
                </p>
                <p>
                    volunteers wanted. contributions, donations greatly accepted.
                </p>
                <p>
                    <a href={process.env.REACT_APP_GITHUB_URL} target="_blank"><b>open source - readme/quick start</b></a>
                </p>
                <div className="welcome-video-container">
                    <video
                        ref={videoRef}
                        className="welcome-video"
                        controls
                        preload="metadata"
                        poster={poster}
                        crossOrigin="anonymous"
                    >
                        <source src="https://stuffedanimalwar.com/videos/maiden.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
                <p className="invisible-text">
                    {props.pageCount}
                </p>
            </div>
        </div>
    );
}

export default Welcome;