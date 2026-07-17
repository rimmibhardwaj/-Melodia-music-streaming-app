"use client";
import { useState, useEffect, useRef } from "react";

import { SongCard } from "@/components/SongCard";
import { useTracks } from "@/hooks/useTracks";
import { useRecentlyPlayed } from "@/hooks/useRecentlyPlayed";
import { Play, ChevronRight, Headphones } from "lucide-react";
import Link from "next/link";
import { usePlayer } from "@/context/PlayerContext";
import { useDominantColor } from "@/hooks/useDominantColor";
import { ApiUnavailable } from "@/components/ApiUnavailable";

type TimeTheme = {
  heading: string;
  accent: string;
  accentHover: string;
  accentGlow: string;
  bgDarken: string;
};

function getTimeOfDayTheme(): TimeTheme {
  const h = new Date().getHours();
  
  if (h >= 5 && h < 12) {
    return {
      heading: "Morning Motivation",
      accent: "#f59e0b",
      accentHover: "#d97706",
      accentGlow: "rgba(245, 158, 11, 0.2)",
      bgDarken: "rgba(0,0,0,0)",
    };
  } else if (h >= 12 && h < 17) {
    return {
      heading: "Afternoon Focus",
      accent: "#3b82f6",
      accentHover: "#2563eb",
      accentGlow: "rgba(59, 130, 246, 0.2)",
      bgDarken: "rgba(0,0,0,0)",
    };
  } else if (h >= 17 && h < 21) {
    return {
      heading: "Evening Unwind",
      accent: "#FF3366",
      accentHover: "#ff4d79",
      accentGlow: "rgba(255, 51, 102, 0.2)",
      bgDarken: "rgba(0,0,0,0)",
    };
  } else {
    return {
      heading: "Late Night Listening",
      accent: "#FF3366",
      accentHover: "#ff4d79",
      accentGlow: "rgba(255, 51, 102, 0.2)",
      bgDarken: "rgba(0,0,0,0.3)",
    };
  }
}

export default function Home() {
  const { recentlyPlayed, isLoading: isLoadingRecentlyPlayed } = useRecentlyPlayed();
  const { data: madeForYou, isLoading: isLoadingMadeForYou, error: errorMadeForYou } = useTracks({ search: "top songs 2024" });
  const { playSong } = usePlayer();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 600, behavior: 'smooth' });
    }
  };

  const heroSong = recentlyPlayed?.[0] || madeForYou?.[0];
  const dominantColor = useDominantColor(heroSong?.thumbnailUrl);

  const [theme, setTheme] = useState<TimeTheme>({
    heading: "Late Night Listening",
    accent: "#FF3366",
    accentHover: "#ff4d79",
    accentGlow: "rgba(255, 51, 102, 0.2)",
    bgDarken: "rgba(0,0,0,0.3)"
  });

  useEffect(() => {
    setTheme(getTimeOfDayTheme());
  }, []);

  const quickPicks = recentlyPlayed?.filter(s => s.id !== heroSong?.id).slice(0, 4) || [];

  const SkeletonCard = ({ isQuickPick = false }) => (
    <div className={`animate-pulse bg-[#201633] rounded-xl ${isQuickPick ? "flex items-center h-16 w-full" : "p-4 min-w-[160px] max-w-[200px] aspect-square flex flex-col gap-4"}`}>
      <div className={`${isQuickPick ? "w-16 h-16" : "w-full aspect-square"} bg-[#32234f] rounded-md`}></div>
      <div className={`flex flex-col gap-2 ${isQuickPick ? "px-4 flex-1" : ""}`}>
        <div className="h-4 bg-[#32234f] rounded w-3/4"></div>
        {!isQuickPick && <div className="h-3 bg-[#32234f] rounded w-1/2"></div>}
      </div>
    </div>
  );

  return (
    <div className="p-8 pb-28 relative">
      {/* Hero Ambient Glow */}
      <div 
        className="absolute top-0 left-1/4 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/4 blur-[120px] opacity-20 -z-10 transition-colors duration-700 ease-in-out pointer-events-none rounded-full"
        style={{ backgroundColor: dominantColor }}
      />
      
      {/* Bento Grid Layout */}
      <div 
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        style={{
          '--hero-accent': theme.accent,
          '--hero-accent-hover': theme.accentHover,
          '--hero-glow': theme.accentGlow,
          '--hero-bg-overlay': theme.bgDarken
        } as React.CSSProperties}
      >
        {/* Tile 1: Featured Hero Card (2x2) */}
        {isLoadingRecentlyPlayed || isLoadingMadeForYou ? (
          <div className="lg:col-span-5 lg:row-span-2 h-[380px] animate-pulse bg-white/5 rounded-3xl"></div>
        ) : heroSong ? (
          <div 
            className="lg:col-span-5 lg:row-span-2 relative h-[380px] rounded-3xl overflow-hidden group cursor-pointer glass-card transition-all duration-500 hover:shadow-[color:var(--hero-glow)] flex flex-col"
            onClick={() => playSong(heroSong)}
          >
            <img src={heroSong.thumbnailUrl} alt="Currently playing track" className="absolute inset-0 w-full h-full object-cover text-transparent transition-transform duration-700 group-hover:scale-105" />
            
            <div className="absolute inset-0" style={{ backgroundColor: 'var(--hero-bg-overlay)' }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 p-8 w-full flex items-end justify-between z-10">
              <div className="flex flex-col max-w-[80%]">
                <span className="font-bold text-sm tracking-wider uppercase mb-2 text-[color:var(--hero-accent)] [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]">Continue Listening</span>
                <h3 
                  className="text-3xl font-bold text-white mb-1 font-display tracking-tight line-clamp-2 [text-shadow:0_2px_8px_rgba(0,0,0,0.6)]"
                  title={heroSong.title}
                >
                  {heroSong.title.split('|')[0].trim()}
                </h3>
                <p className="text-[#9D84C7] text-lg font-medium [text-shadow:0_2px_8px_rgba(0,0,0,0.6)]">{heroSong.channelTitle}</p>
              </div>
              
              <button 
                className="text-[#F8F5F0] rounded-full p-4 shadow-xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 bg-[color:var(--hero-accent)] hover:bg-[color:var(--hero-accent-hover)] play-button-glow"
              >
                <Play fill="currentColor" size={28} className="ml-1" />
              </button>
            </div>
          </div>
        ) : null}

        {/* Tile 2: Quick Picks (2x2 Grid) */}
        <div className="lg:col-span-4 lg:row-span-2 grid grid-cols-2 grid-rows-2 gap-4 h-auto lg:h-[380px]">
          {isLoadingRecentlyPlayed || isLoadingMadeForYou ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-[#201633] rounded-2xl flex flex-col h-full w-full">
                <div className="w-full flex-1 bg-[#32234f] rounded-t-2xl"></div>
                <div className="h-12 bg-[#281c42] rounded-b-2xl p-2"></div>
              </div>
            ))
          ) : quickPicks.map((song) => (
            <div 
              key={song.id}
              className="glass-card transition-all duration-300 rounded-2xl flex flex-col group cursor-pointer shadow-md hover:bg-white/5 overflow-hidden"
              onClick={() => playSong(song)}
            >
              <div className="relative flex-1 w-full overflow-hidden min-h-0">
                <img src={song.thumbnailUrl} alt={song.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                   <Play fill="currentColor" size={28} className="text-white ml-1 shadow-lg drop-shadow-md scale-50 group-hover:scale-100 transition-transform duration-200 ease-out" />
                </div>
              </div>
              <div className="p-3 bg-[#1A1423]/80 backdrop-blur-md border-t border-white/5 shrink-0">
                <span className="font-bold text-[13px] leading-tight truncate block text-[#F8F5F0]" title={song.title}>
                  {song.title.split('|')[0].trim()}
                </span>
                <span className="text-[11px] text-[#9D84C7] truncate block mt-0.5">{song.channelTitle}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tile 3: Made For You (1x2, Vertical Flow) */}
        <section className="lg:col-span-3 lg:row-span-2 glass-panel rounded-3xl p-6 flex flex-col h-[380px] overflow-hidden">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 className="text-xl font-semibold text-[#F8F5F0] tracking-tight font-display">
              Made For You
            </h2>
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto scrollbar-hide flex-1 pb-2 items-center w-full">
            {errorMadeForYou && <ApiUnavailable error={errorMadeForYou} className="w-full my-auto" />}
            
            {!errorMadeForYou && isLoadingMadeForYou ? (
               Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            ) : madeForYou && madeForYou.length > 0 ? (
              madeForYou.map((song) => (
                <SongCard key={song.id} song={song} />
              ))
            ) : !errorMadeForYou ? (
              <div className="text-[#9D84C7] italic px-2 text-sm text-center mt-4">No tracks found.</div>
            ) : null}
          </div>
        </section>

        {/* Tile 4: Recently Played (Full Width 4x1) */}
        <section className="lg:col-span-12 glass-panel rounded-3xl p-6 relative overflow-hidden mt-2">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF3366]/5 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h2 className="text-2xl font-semibold text-[#F8F5F0] tracking-tight font-display flex items-center gap-3">
              <span className="w-2 h-6 bg-[#FF3366] rounded-full"></span>
              Recently Played
            </h2>
          </div>
          <div className="relative group/row z-10">
            <div 
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto pb-4 scroll-smooth scrollbar-hide w-full"
            >
              {isLoadingRecentlyPlayed ? (
                 Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              ) : recentlyPlayed && recentlyPlayed.length > 0 ? (
                recentlyPlayed.map((song) => (
                  <SongCard key={song.id} song={song} />
                ))
              ) : (
                <div className="w-full flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#201633] flex items-center justify-center mb-4 shadow-inner">
                    <Headphones size={32} className="text-[#9D84C7]/50" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#F8F5F0] font-display mb-2">Nothing here yet</h3>
                  <p className="text-[#9D84C7] text-sm mb-6 max-w-sm">Play something above to start building your history</p>
                  <Link 
                    href="/explore" 
                    className="px-6 py-2 rounded-full border border-[#FF3366] text-[#FF3366] font-medium hover:bg-[#FF3366] hover:text-[#F8F5F0] transition-colors"
                  >
                    Explore Music
                  </Link>
                </div>
              )}
            </div>
            
            {/* Right edge fade and scroll button */}
            {recentlyPlayed && recentlyPlayed.length > 0 && (
              <div className="absolute right-0 top-0 bottom-4 w-32 bg-gradient-to-l from-[#160f24] to-transparent pointer-events-none flex items-center justify-end pr-2 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300">
                <button 
                  onClick={scrollRight}
                  className="pointer-events-auto bg-black/60 text-white p-2 rounded-full hover:bg-[#FF3366] transition-colors shadow-lg backdrop-blur-sm"
                  title="Scroll right"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
