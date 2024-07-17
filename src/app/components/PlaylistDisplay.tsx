import React, { useState, useEffect } from "react";
import YouTubePlayer from "./YouTubePlayer";

interface PlaylistItem {
  title: string;
  videoId: string;
}

function PlaylistDisplay() {
  const [playlistItems, setPlaylistItems] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shuffleFinished, setShuffleFinished] = useState(false);

  const fetchPlaylistItems = async () => {
    setLoading(true);
    setError("");

    const urls = [
      "https://youtube-shuffle-next-js.vercel.app/api/youtube",
      "http://localhost:3000/api/youtube",
    ];

    let success = false;

    for (const url of urls) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const filteredItems = filterVideos(data.playlistItems);
        shuffleArray(filteredItems);
        setPlaylistItems(filteredItems);
        setShuffleFinished(true);
        success = true;
        break;
      } catch (error) {
        console.error(`Fetch error from ${url}:`, error);
      }
    }

    if (!success) {
      setError(
        "Failed to fetch playlist items from both sources. Please try again later."
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPlaylistItems(); //fetch on coponent mount;
  }, []);

  function shuffleArray(array: any) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  const filterVideos = (videos: any[]) => {
    return videos.filter(
      (item: { title: string }) =>
        item.title !== "Deleted video" && item.title !== "Private video"
    );
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <>
          {shuffleFinished && <YouTubePlayer playlistItems={playlistItems} />}
        </>
      )}
    </div>
  );
}

export default PlaylistDisplay;
