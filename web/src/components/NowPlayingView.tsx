import React, { useEffect, useRef, useState } from "react";
import { X, Play, Pause, SkipBack, SkipForward, Volume2, Heart, Share2, Mic } from "lucide-react";
import { useLyrics, useActiveLyricIndex } from "@/hooks/useLyrics";

export interface NowPlayingViewProps {
  isOpen: boolean;
  onClose: () => void;
  // State
  currentSong: any; 
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isLiked: boolean;
  // Handlers
  togglePlay: () => void;
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleLike: (e: React.MouseEvent) => void;
  handleShare: (e: React.MouseEvent) => void;
  // Format util
  formatTime: (time: number) => string;
}

export function NowPlayingView({
  isOpen,
  onClose,
  currentSong,
  isPlaying,
  progress,
  duration,
  volume,
  isLiked,
  togglePlay,
  handleSeek,
  handleVolumeChange,
  toggleLike,
  handleShare,
  formatTime
}: NowPlayingViewProps) {
  const [mounted, setMounted] = useState(isOpen);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Small delay to allow DOM to render before triggering CSS transition
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimateIn(true)));
    } else {
      setAnimateIn(false);
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const { lyrics, loading, error } = useLyrics(
    currentSong?.title || null, 
    currentSong?.channelTitle || null, 
    duration, 
    currentSong?.id || null
  );
  
  const activeIndex = useActiveLyricIndex(lyrics?.synced ?? null, progress);
  const activeLineRef = useRef<HTMLParagraphElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (isOpen) {
      activeLineRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeIndex, isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!mounted || !currentSong) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col overflow-hidden transition-all duration-300 ease-out bg-[#0A0710] ${
        animateIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
      }`}
    >
      
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img 
          src={currentSong.thumbnailUrl} 
          alt="" 
          className="w-full h-full object-cover blur-[100px] scale-125 opacity-40"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Main Scrollable Content */}
      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-hide flex flex-col items-center pt-8">
        
        {/* Sticky Top Section */}
        <div className="sticky top-0 w-full flex flex-col items-center pt-6 pb-8 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-20 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-2 right-6 p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X size={32} />
          </button>
          
          <img 
            src={currentSong.thumbnailUrl} 
            alt={currentSong.title} 
            className="w-48 h-48 md:w-80 md:h-80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] object-cover"
          />
          <h1 className="text-2xl md:text-4xl font-bold text-white mt-6 text-center max-w-3xl px-4 truncate w-full font-display tracking-tight">
            {currentSong.title}
          </h1>
          <p className="text-base md:text-xl text-[#FF2E74] mt-1 text-center font-medium">
            {currentSong.channelTitle}
          </p>
        </div>

        {/* Scrollable Lyrics Section */}
        <div className="w-full max-w-4xl px-6 py-4 flex flex-col items-center flex-1 min-h-[40vh] z-10">
          {loading && (
            <p className="text-center text-lg text-white/50 my-10 animate-pulse">Loading lyrics...</p>
          )}

          {!loading && (error || !lyrics) && (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <Mic className="h-12 w-12 text-white/20" />
              <p className="text-lg text-white/60">Lyrics not available for this track.</p>
            </div>
          )}

          {!loading && lyrics?.synced && lyrics.synced.length > 0 && (
            <div className="flex flex-col gap-6 text-center w-full pb-[25vh]">
              {lyrics.synced.map((line, i) => (
                <p
                  key={`${line.time}-${i}`}
                  ref={i === activeIndex ? activeLineRef : null}
                  className={`text-xl md:text-3xl transition-all duration-300 ease-in-out px-4 py-1 rounded-xl ${
                    i === activeIndex
                      ? "font-bold text-white scale-[1.05]"
                      : i < activeIndex
                      ? "font-medium text-white/40"
                      : "font-medium text-white/20 hover:text-white/40 cursor-default"
                  }`}
                >
                  {line.text || "♪"}
                </p>
              ))}
            </div>
          )}

          {!loading && !lyrics?.synced && lyrics?.plain && (
            <p className="whitespace-pre-line text-lg md:text-2xl leading-loose text-white/80 font-medium text-center pb-[25vh] px-4">
              {lyrics.plain}
            </p>
          )}
        </div>
      </div>

      {/* Fixed Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-30 w-full bg-gradient-to-t from-black via-black/80 to-transparent pt-24 pb-8 px-6 md:px-12 flex flex-col items-center pointer-events-none">
        <div className="w-full max-w-4xl flex flex-col gap-6 pointer-events-auto">
          
          {/* Progress Bar */}
          <div className="flex items-center gap-4 w-full text-sm font-medium text-white/70">
            <span className="w-12 text-right">{formatTime(progress)}</span>
            <div className="flex-1 group flex items-center h-4 cursor-pointer">
              <input 
                type="range" 
                min="0" 
                max={duration || 0} 
                value={progress} 
                onChange={handleSeek}
                style={{
                  background: `linear-gradient(to right, #FF2E74 ${(progress / (duration || 1)) * 100}%, rgba(255,255,255,0.2) ${(progress / (duration || 1)) * 100}%)`
                }}
                className="w-full h-1.5 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white hover:[&::-webkit-slider-thumb]:bg-[#FF2E74] hover:[&::-webkit-slider-thumb]:scale-125 [&::-webkit-slider-thumb]:rounded-full cursor-pointer transition-all shadow-lg"
              />
            </div>
            <span className="w-12 text-left">{formatTime(duration)}</span>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-6 w-[20%]">
              <button 
                onClick={toggleLike}
                className={`transition hover:scale-110 ${isLiked ? "text-[#FF2E74]" : "text-white/70 hover:text-white"}`}
              >
                <Heart size={28} fill={isLiked ? "currentColor" : "none"} />
              </button>
              <button 
                onClick={handleShare}
                className="text-white/70 hover:text-white hover:scale-110 transition"
              >
                <Share2 size={24} />
              </button>
            </div>

            <div className="flex items-center justify-center gap-8 flex-1">
              <button className="text-white/70 hover:text-white transition hover:scale-110">
                <SkipBack size={32} fill="currentColor" />
              </button>
              <button 
                onClick={togglePlay}
                className="w-16 h-16 bg-[#FF2E74] text-white shadow-[0_0_20px_rgba(255,46,116,0.4)] rounded-full flex items-center justify-center hover:scale-105 hover:bg-[#e02665] transition-all"
              >
                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
              </button>
              <button className="text-white/70 hover:text-white transition hover:scale-110">
                <SkipForward size={32} fill="currentColor" />
              </button>
            </div>

            <div className="flex items-center gap-3 w-[20%] justify-end text-white/70">
              <Volume2 size={20} />
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume} 
                onChange={handleVolumeChange}
                style={{
                  background: `linear-gradient(to right, #FF2E74 ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%)`
                }}
                className="w-24 h-1.5 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-pointer transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
