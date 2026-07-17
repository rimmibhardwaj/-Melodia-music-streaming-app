import { useState, useEffect, useCallback } from "react";
import { Song } from "@/types";

const RECENTLY_PLAYED_KEY = "melodia_recently_played";
const MAX_RECENT_SONGS = 30;

export function useRecentlyPlayed() {
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Read from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENTLY_PLAYED_KEY);
      if (stored) {
        setRecentlyPlayed(JSON.parse(stored));
        console.log("Recently played loaded from local storage:", JSON.parse(stored));
      } else {
        console.log("Recently played loaded from local storage: empty");
      }
    } catch (err) {
      console.error("Failed to read recently played from localStorage", err);
    } finally {
      setIsLoading(false);
    }

    // Listen to changes from other tabs or components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === RECENTLY_PLAYED_KEY && e.newValue) {
        try {
          setRecentlyPlayed(JSON.parse(e.newValue));
        } catch (err) {
          // ignore
        }
      }
    };
    
    // Custom event for same-tab updates
    const handleLocalUpdate = () => {
      try {
        const stored = localStorage.getItem(RECENTLY_PLAYED_KEY);
        if (stored) {
          setRecentlyPlayed(JSON.parse(stored));
        }
      } catch (err) {
        // ignore
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("recentlyPlayedUpdated", handleLocalUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("recentlyPlayedUpdated", handleLocalUpdate);
    };
  }, []);

  const addSongToRecent = useCallback((song: Song) => {
    try {
      const stored = localStorage.getItem(RECENTLY_PLAYED_KEY);
      let currentList: Song[] = [];
      if (stored) {
        currentList = JSON.parse(stored);
      }

      // Remove the song if it already exists to move it to the front
      currentList = currentList.filter((s) => s.id !== song.id);
      
      // Add to front
      currentList.unshift(song);
      
      // Cap the length
      if (currentList.length > MAX_RECENT_SONGS) {
        currentList = currentList.slice(0, MAX_RECENT_SONGS);
      }

      localStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(currentList));
      setRecentlyPlayed(currentList);
      
      // Dispatch event so other components update
      window.dispatchEvent(new Event("recentlyPlayedUpdated"));
    } catch (err) {
      console.error("Failed to save recently played song", err);
    }
  }, []);

  return { recentlyPlayed, isLoading, addSongToRecent };
}
