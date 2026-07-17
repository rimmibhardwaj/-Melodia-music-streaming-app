"use client";

import { Song } from "@/types";
import { usePlayer } from "@/context/PlayerContext";
import { usePlaylists } from "@/hooks/usePlaylists";
import { useToast } from "@/context/ToastContext";
import { Play, Pause, Heart, Share2 } from "lucide-react";
import Image from "next/image";

export default function TrackDetailClient({ song }: { song: Song }) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const { playlists, addTrackToPlaylist, removeTrackFromPlaylist } = usePlaylists();
  const { showToast } = useToast();

  const isCurrentSong = currentSong?.id === song.id;
  const isCurrentlyPlaying = isCurrentSong && isPlaying;

  const likedSongsPlaylist = playlists.find(p => p.id === "liked_songs");
  const isLiked = likedSongsPlaylist?.tracks?.some(t => t.id === song.id);

  const handlePlayClick = () => {
    if (isCurrentSong) {
      togglePlay();
    } else {
      playSong(song);
    }
  };

  const toggleLike = () => {
    if (isLiked) {
      removeTrackFromPlaylist("liked_songs", song.id);
    } else {
      addTrackToPlaylist("liked_songs", song);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/track/${song.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: song.title,
          text: `Check out ${song.title} by ${song.channelTitle} on MELODIA`,
          url: url,
        });
      } catch (err) {
        navigator.clipboard.writeText(url);
        showToast("Link copied to clipboard!");
      }
    } else {
      navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard!");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header section with gradient background */}
      <div className="relative p-8 pb-12 flex items-end gap-8 overflow-hidden z-10 shrink-0">
        {/* Blurred background image */}
        <div 
          className="absolute inset-0 z-0 opacity-40 blur-[80px] scale-150 transform-gpu pointer-events-none"
          style={{
            backgroundImage: `url(${song.thumbnailUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0710] to-transparent z-0 opacity-90 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 w-52 h-52 shadow-[0_20px_50px_rgba(0,0,0,0.5)] shrink-0 rounded-xl overflow-hidden group">
          <img 
            src={song.thumbnailUrl} 
            alt={song.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        <div className="relative z-10 flex flex-col gap-2">
          <span className="text-[#F8F5F0] text-sm font-semibold uppercase tracking-widest drop-shadow-md">Song</span>
          <h1 className="text-5xl md:text-7xl font-black text-[#F8F5F0] tracking-tighter drop-shadow-lg mb-2">
            {song.title}
          </h1>
          <div className="flex items-center gap-2 text-[#F8F5F0] font-medium text-sm drop-shadow-md">
            <span className="text-[#FF3366] font-bold hover:underline cursor-pointer">{song.channelTitle}</span>
            <span className="w-1 h-1 rounded-full bg-[#9D84C7]" />
            <span className="text-[#9D84C7]">
              {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Controls section */}
      <div className="p-8 flex-1 bg-gradient-to-b from-black/20 to-transparent">
        <div className="flex items-center gap-6 mb-8">
          <button 
            className="w-16 h-16 bg-[#FF3366] text-[#F8F5F0] rounded-full flex items-center justify-center hover:scale-105 hover:bg-[#ff4d79] transition-all shadow-[0_8px_30px_rgba(255,51,102,0.4)]"
            onClick={handlePlayClick}
          >
            {isCurrentlyPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </button>
          
          <button 
            className={`transition hover:scale-110 ${isLiked ? "text-[#FF3366]" : "text-[#9D84C7] hover:text-[#FF3366]"}`}
            onClick={toggleLike}
            title={isLiked ? "Unlike" : "Like"}
          >
            <Heart size={36} fill={isLiked ? "currentColor" : "none"} />
          </button>
          
          <button 
            className="text-[#9D84C7] hover:text-[#F8F5F0] transition hover:scale-110"
            onClick={handleShare}
            title="Share"
          >
            <Share2 size={32} />
          </button>
        </div>
      </div>
    </div>
  );
}
