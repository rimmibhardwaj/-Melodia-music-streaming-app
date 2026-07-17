"use client";

import { useTracks } from "@/hooks/useTracks";
import { SongCard } from "@/components/SongCard";
import { useRef, useState } from "react";
import { ChevronRight, RefreshCw, Play } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { Song } from "@/types";
import { ApiUnavailable } from "@/components/ApiUnavailable";

const CATEGORIES = [
  { id: "feel-good", title: "Feel Good", baseQuery: "feel good hindi english songs playlist", modifiers: ["", "new", "top hits", "upbeat", "best"] },
  { id: "chill-beats", title: "Chill Beats", baseQuery: "lofi chill songs playlist", modifiers: ["", "study", "relax", "instrumental", "aesthetic"] },
  { id: "bollywood-hits", title: "Bollywood Hits", baseQuery: "bollywood hit songs", modifiers: ["2024", "2025", "romantic", "dance party", "new releases"] },
  { id: "workout-energy", title: "Workout Energy", baseQuery: "workout gym motivation songs", modifiers: ["", "heavy bass", "electronic EDM", "rock metal", "hip hop"] },
  { id: "late-night", title: "Late Night", baseQuery: "late night acoustic songs playlist", modifiers: ["", "sad emotional", "unplugged raw", "covers", "indie"] },
  { id: "trending-now", title: "Trending Now", baseQuery: "trending songs this week", modifiers: ["", "viral global", "tiktok hits", "pop top 40", "chartbusters"] },
];

const SkeletonCard = () => (
  <div className="animate-pulse bg-[#201633] rounded-2xl p-4 min-w-[220px] max-w-[280px] aspect-square flex flex-col gap-4">
    <div className="w-full aspect-square bg-[#32234f] rounded-xl"></div>
    <div className="px-1 pb-1 mt-auto">
      <div className="h-5 bg-[#32234f] rounded w-3/4"></div>
    </div>
  </div>
);

const ExploreSongCard = ({ song }: { song: Song }) => {
  const { playSong } = usePlayer();

  return (
    <div 
      className="glass-card transition-all duration-500 rounded-2xl cursor-pointer group flex flex-col relative min-w-[220px] max-w-[280px] flex-1 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#FF3366]/20 p-4 gap-4"
      onClick={() => playSong(song)}
    >
      <div className="relative w-full aspect-square shadow-lg overflow-hidden rounded-xl">
        <img 
          src={song.thumbnailUrl} 
          alt={song.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-500 flex items-center justify-center">
           <button className="opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 transform bg-[#FF3366] text-[#F8F5F0] rounded-full p-4 shadow-xl">
             <Play fill="currentColor" size={28} className="ml-1" />
           </button>
        </div>
      </div>
      <div className="px-1 pb-1">
        <h3 className="font-semibold truncate text-lg text-[#F8F5F0]" title={song.title}>
          {song.title.split('|')[0].trim()}
        </h3>
      </div>
    </div>
  );
};

function CategoryRow({ category }: { category: typeof CATEGORIES[0] }) {
  const [modifierIndex, setModifierIndex] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeQuery = `${category.baseQuery} ${category.modifiers[modifierIndex]}`.trim();
  const { data: songs, isLoading, error } = useTracks({ search: activeQuery });

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 600, behavior: 'smooth' });
    }
  };

  const handleShuffle = () => {
    if (isShuffling) return;
    
    setIsShuffling(true);
    
    // Move to next modifier in a circular fashion
    setModifierIndex((prev) => (prev + 1) % category.modifiers.length);
    
    // Debounce to prevent spamming the shuffle button
    setTimeout(() => {
      setIsShuffling(false);
    }, 2000);
  };

  if (error) {
    return (
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6 group/header">
          <h3 className="text-3xl font-bold text-white tracking-tight font-display">{category.title}</h3>
        </div>
        <ApiUnavailable error={error} className="w-full" />
      </div>
    );
  }

  const isActuallyLoading = isLoading || (isShuffling && (!songs || songs.length === 0));

  return (
    <div className="mb-14 relative">
      <div className="flex items-center gap-3 mb-6 group/header">
        <h3 className="text-3xl font-bold text-white tracking-tight font-display">{category.title}</h3>
        <button 
          onClick={handleShuffle}
          disabled={isShuffling}
          className={`text-[#9D84C7] hover:text-[#F8F5F0] transition-all p-1.5 rounded-full hover:bg-white/10 opacity-50 group-hover/header:opacity-100 ${isShuffling ? 'cursor-not-allowed opacity-50' : ''}`}
          title="Show me something else"
        >
          <RefreshCw size={18} className={isShuffling ? 'animate-spin' : ''} />
        </button>
      </div>
      
      <div className="relative group/row z-10">
        <div 
          ref={scrollRef}
          className={`flex gap-8 overflow-x-auto pb-6 scroll-smooth scrollbar-hide transition-opacity duration-300 ${isShuffling ? 'opacity-50' : 'opacity-100'}`}
        >
          {isActuallyLoading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : songs && songs.length > 0 ? (
            songs.map((song) => (
              <ExploreSongCard key={song.id} song={song} />
            ))
          ) : (
            <div className="text-gray-400 italic">No tracks found.</div>
          )}
        </div>
        
        {/* Right edge fade and scroll button */}
        {songs && songs.length > 0 && !isActuallyLoading && (
          <div className="absolute right-0 top-0 bottom-4 w-32 bg-gradient-to-l from-[#0A0710] to-transparent pointer-events-none flex items-center justify-end pr-2 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300">
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
    </div>
  );
}

export default function Library() {
  return (
    <div className="p-6 pb-24">
      <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Explore</h2>
      <p className="text-gray-400 mb-8">Discover new music across different moods and genres.</p>

      <div className="flex flex-col">
        {CATEGORIES.map((category) => (
          <CategoryRow key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
