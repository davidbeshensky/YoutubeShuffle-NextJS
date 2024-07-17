import React, { useState, useEffect, useRef } from "react";
import { FiCopy } from "react-icons/fi";
import { MdRemove } from "react-icons/md";

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
  const [playedSongs, setPlayedSongs] = useState<PlaylistItem[]>([]);
  const [isListVisible, setIsListVisible] = useState(true);
  const [videoIndex, setVideoIndex] = useState(0);

  // Load the YouTube Iframe API script and set up the player
  useEffect(() => {
    const loadYouTubeIframeAPI = () => {
      const script = document.createElement("script");
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

  const initializePlayer = () => {
    playerRef.current = new YT.Player("youtube-player", {
      height: "100%",
      width: "100%",
      videoId: playlistItems[videoIndex].videoId,
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError,
      },
    });
  };

  useEffect(() => {
    if (
      playStarted &&
      isApiLoaded &&
      playlistItems.length > 0 &&
      !playerRef.current
    ) {
      initializePlayer();
      setPlayedSongs([playlistItems[videoIndex]]); // Add the first song initially
    }
  }, [playStarted, isApiLoaded, playlistItems.length]);

  const onPlayerReady = (event: any) => {
    setPlayerReady(true);
    event.target.playVideo();
    updatePlayerSize();
  };

  useEffect(() => {
    if (playerRef.current && playerReady && videoIndex > 0) {
      playerRef.current.loadVideoById(playlistItems[videoIndex].videoId);
      setPlayedSongs((prev) => [...prev, playlistItems[videoIndex]]);
    }
  }, [videoIndex, playerReady]);

  const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
    if (event.data === YT.PlayerState.ENDED) {
      setVideoIndex((prevIndex) => {
        const nextIndex =
          prevIndex + 1 < playlistItems.length ? prevIndex + 1 : 0;
        console.log("New videoIndex:", nextIndex);
        return nextIndex;
      });
    }
  };

  const onPlayerError = (event: YT.OnErrorEvent) => {
    console.log("Error playing video", event.data);
    setVideoIndex((prevIndex) => {
      const nextIndex =
        prevIndex + 1 < playlistItems.length ? prevIndex + 1 : 0;
      console.log("New videoIndex on error:", nextIndex);
      return nextIndex;
    });
  };

  // Start playing the sequence
  const startVideoSequence = () => {
    if (!playStarted) {
      setPlayStarted(true);
      setShowButton(false);
    }
    if (playerRef.current && playerReady) {
      playerRef.current.playVideo();
    }
  };

  useEffect(() => {
    setFinishedShuffle(true);
  }, [playlistItems]);

  useEffect(() => {
    if (finishedShuffle) {
      const timer = setTimeout(() => {
        setShowButton(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [finishedShuffle]);

  const copyToClipboard = () => {
    const playedTitles = playedSongs.map((song) => song.title).join("\n");
    navigator.clipboard.writeText(playedTitles);
  };

  const toggleListVisibility = () => {
    setIsListVisible(!isListVisible);
  };

  const updatePlayerSize = () => {
    if (playerRef.current) {
        const aspectRatio = 16/9;
        const width = window.innerWidth;
        const height = window.innerWidth / aspectRatio;
        playerRef.current.setSize(width, height);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", updatePlayerSize);
    return () => {
        window.removeEventListener("resize", updatePlayerSize);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {!playStarted && !showButton && (
        <div className="flex items-center justify-center absolute inset-0">
          <div className="loader"></div>
        </div>
      )}
      {playStarted && (
        <div className="flex items-center justify-center py-12``">
          <div id="youtube-player"></div>
        </div>
      )}
      {showButton && (
        <button
          onClick={startVideoSequence}
          className="mb-4 bg-slate-600 text-white px-4 py-2 rounded"
        >
          Start Roll Sequence
        </button>
      )}
      {playStarted && (
        <div className="relative bg-slate-600 px-4 pt-2 pb-2 rounded shadow-lg w-3/4 max-w-lg">
          {isListVisible ? (
            <ul className="list-none">
              {playedSongs.map((item, index) => (
                <li key={index}>{item.title}</li>
              ))}
            </ul>
          ) : (
            <div className="text-white">
              {playedSongs[videoIndex]?.title || "No song playing"}
            </div>
          )}
          <div className="absolute top-0 right-0 pt-2 pr-2 space-x-2">
            <button onClick={copyToClipboard} className="text-white">
              <FiCopy size={20} />
            </button>
            <button onClick={toggleListVisibility} className="text-white">
              <MdRemove size={20} />
            </button>
          </div>
        </div>
      )}
      <style jsx>{`
        .loader {
          border: 8px solid #f3f3f3;
          border-top: 8px solid #3498db;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          animation: spin 2s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default YouTubePlayer;
