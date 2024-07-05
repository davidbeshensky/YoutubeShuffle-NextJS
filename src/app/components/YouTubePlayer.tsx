import React, { useState, useEffect, useRef } from 'react';
import { finished } from 'stream';

interface PlaylistItem {
    title: string;
    videoId: string;
}

interface YouTubePlayerProps {
    playlistItems: PlaylistItem[];
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ playlistItems }) => {
    const playerRef = useRef<YT.Player | null>(null);
    const [isApiLoaded, setIsApiLoaded] = useState(false);
    const [playStarted, setPlayStarted] = useState(false);
    const [playerReady, setPlayerReady] = useState(false);
    const [finishedShuffle, setFinishedShuffle] = useState(false);
    const [showButton, setShowButton] = useState(false);
    let videoIndex = 0;

    // Load the YouTube Iframe API script and set up the player
    useEffect(() => {
        const loadYouTubeIframeAPI = () => {
            const script = document.createElement('script');
            script.src = "https://www.youtube.com/iframe_api";
            script.onload = () => {
                window.onYouTubeIframeAPIReady = () => {
                    setIsApiLoaded(true);
                };
            };
            document.body.appendChild(script);
        };

        if (!window.YT) {
            loadYouTubeIframeAPI();
        } else {
            setIsApiLoaded(true);
        }
    }, []);

    // Initialize or update the player
    useEffect(() => {
        if (playStarted && isApiLoaded && playlistItems.length > 0 && !playerRef.current) {
            playerRef.current = new YT.Player('youtube-player', {
                height: '360',
                width: '640',
                videoId: playlistItems[0].videoId, // Initialize with the first video
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange,
                    'onError': onPlayerError
                }
            });
        }
    }, [playStarted, isApiLoaded, playlistItems, videoIndex]);

    // Handle player ready state
    const onPlayerReady = (event: any) => {
        setPlayerReady(true);
        event.target.playVideo();
    };

    // Listen for the player state changes to handle video ends
    const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
        if (event.data === YT.PlayerState.ENDED) {
            playNextVideo();
        }
    };

    const onPlayerError = (event: YT.OnErrorEvent) => {
        console.log('error playling video', event.data);
        playNextVideo();
    }

    const playNextVideo = () => {
        videoIndex +=1;
        console.log('playing next video at index:', videoIndex);
        playerRef.current?.loadVideoById(playlistItems[videoIndex].videoId);

    }

    // Start playing the sequence
    const startVideoSequence = () => {
        if (!playStarted) {
            setPlayStarted(true);
        }
        if (playerRef.current && playerReady) {
            playerRef.current.playVideo();
        }
    };

    useEffect(() => {
        setFinishedShuffle(true);
        console.log(finishedShuffle);
    }, [playlistItems])

    useEffect(() => {
        if (finishedShuffle) {
            const timer = setTimeout(() => {
                setShowButton(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [finishedShuffle]);

    return (
        <div>
            {playStarted && (
                <div id="youtube-player"></div>
            )}
            {showButton &&(
                <button onClick={startVideoSequence}>Start Roll Sequence</button>
            )}
        </div>
    );
};

export default YouTubePlayer;
