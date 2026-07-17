"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Song } from "@/types";
import { useRecentlyPlayed } from "@/hooks/useRecentlyPlayed";

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  showLyrics: boolean;
  playSong: (song: Song) => void;
  togglePlay: () => void;
  setIsPlaying: (playing: boolean) => void;
  setShowLyrics: (show: boolean) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const { addSongToRecent } = useRecentlyPlayed();

  const playSong = (song: Song) => {
    // If the same song is clicked, just play it
    if (currentSong?.id === song.id) {
      setIsPlaying(true);
      return;
    }
    setCurrentSong(song);
    setIsPlaying(true);
    addSongToRecent(song);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <PlayerContext.Provider value={{ currentSong, isPlaying, showLyrics, playSong, togglePlay, setIsPlaying, setShowLyrics }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
