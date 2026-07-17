"use client";

import { Play, Pause, MoreVertical, Plus, Heart, Share2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Song } from "@/types";
import { usePlayer } from "@/context/PlayerContext";
import { usePlaylists } from "@/hooks/usePlaylists";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const PlaylistMenu = ({ 
  playlists, 
  song, 
  addTrackToPlaylist, 
  removeTrackFromPlaylist, 
  closeMenu,
  menuPosition,
  menuContentRef
}: any) => {
  const customPlaylists = playlists.filter((p: any) => !p.isCurated);
  const curatedPlaylists = playlists.filter((p: any) => p.isCurated);

  const renderPlaylistOption = (p: any) => {
    const isAdded = p.tracks?.some((t: any) => t.id === song.id);
    return (
      <button
        key={p.id}
        className="w-full text-left px-3 py-1.5 text-sm hover:bg-[#FF3366]/10 rounded-sm truncate flex items-center justify-between transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          if (isAdded) {
            removeTrackFromPlaylist(p.id, song.id);
          } else {
            addTrackToPlaylist(p.id, song);
          }
          closeMenu();
        }}
      >
        <span className={isAdded ? "text-[#FF3366]" : "text-[#F8F5F0]"}>{p.name}</span>
        {isAdded ? <span className="text-xs text-[#FF3366]">✓</span> : <Plus size={14} className="text-[#9D84C7]" />}
      </button>
    );
  };

  return (
    <div 
      ref={menuContentRef}
      style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
      className="absolute bg-[#201633] rounded-md shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-1 min-w-[180px] z-[9999] border border-[#32234f] overflow-hidden"
    >
      <div className="max-h-60 overflow-y-auto scrollbar-hide">
        <div className="text-xs text-[#9D84C7] font-bold px-3 py-2 border-b border-[#32234f] mb-1">Your Playlists</div>
        {customPlaylists.length === 0 ? (
          <div className="px-3 py-1 text-xs text-[#9D84C7] opacity-60 mb-1">No custom playlists</div>
        ) : (
          <div className="mb-2">
            {customPlaylists.map(renderPlaylistOption)}
          </div>
        )}
        
        <div className="text-xs text-[#9D84C7] font-bold px-3 py-2 border-t border-b border-[#32234f] mb-1 mt-1">Curated Playlists</div>
        <div className="mb-1">
          {curatedPlaylists.map(renderPlaylistOption)}
        </div>
      </div>
    </div>
  );
};

export function SongCard({ song, isQuickPick = false }: { song: Song, isQuickPick?: boolean }) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const { playlists, addTrackToPlaylist, removeTrackFromPlaylist } = usePlaylists();
  const { showToast } = useToast();
  
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const menuContentRef = useRef<HTMLDivElement>(null);

  const isCurrentSong = currentSong?.id === song.id;
  const isCurrentlyPlaying = isCurrentSong && isPlaying;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentSong) {
      togglePlay();
    } else {
      playSong(song);
    }
  };

  const likedSongsPlaylist = playlists.find(p => p.id === "liked_songs");
  const isLiked = likedSongsPlaylist?.tracks?.some(t => t.id === song.id);

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) {
      removeTrackFromPlaylist("liked_songs", song.id);
    } else {
      addTrackToPlaylist("liked_songs", song);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        (!menuContentRef.current || !menuContentRef.current.contains(e.target as Node))
      ) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!showMenu && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const menuWidth = 180;
      const estimatedHeight = 250; // max-h-60 + padding

      let top = rect.bottom + window.scrollY + 8;
      let left = rect.right - menuWidth + window.scrollX;

      // Flip upward if not enough space below
      if (rect.bottom + estimatedHeight > window.innerHeight) {
        top = rect.top - estimatedHeight + window.scrollY - 8;
      }

      setMenuPosition({ top, left });
    }
    
    setShowMenu(!showMenu);
  };
  
  const menuContent = showMenu && mounted ? createPortal(
    <PlaylistMenu 
      playlists={playlists}
      song={song}
      addTrackToPlaylist={addTrackToPlaylist}
      removeTrackFromPlaylist={removeTrackFromPlaylist}
      closeMenu={() => setShowMenu(false)}
      menuPosition={menuPosition}
      menuContentRef={menuContentRef}
    />,
    document.body
  ) : null;

  if (isQuickPick) {
    return (
      <div 
        className={`glass-card hover:bg-white/5 transition-colors duration-300 rounded-xl cursor-pointer group flex items-center justify-between relative w-full max-w-sm ${isCurrentlyPlaying ? 'bg-white/10' : ''}`}
        onClick={() => playSong(song)}
      >
        <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-l-xl">
          <img src={song.thumbnailUrl} alt={song.title} className="w-full h-full object-cover shadow-[4px_0_10px_rgba(0,0,0,0.3)] transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
            <button onClick={handlePlayClick} className="scale-50 group-hover:scale-100 transition-transform duration-200 ease-out text-[#F8F5F0]">
              {isCurrentlyPlaying ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} className="ml-1" />}
            </button>
          </div>
        </div>
        
        <span className={`px-4 font-bold text-sm truncate flex-1 ${isCurrentSong ? "text-[#FF3366]" : "text-[#F8F5F0]"}`}>{song.title}</span>
        
        <div className={`pr-4 opacity-0 group-hover:opacity-100 transition-all duration-300 drop-shadow-md flex items-center gap-3 ${isCurrentlyPlaying ? "opacity-100" : ""}`}>
          <button 
            onClick={toggleLike} 
            className={`hover:scale-110 transition ${isLiked ? "text-[#FF3366]" : "text-[#9D84C7] hover:text-[#FF3366]"}`}
            title={isLiked ? "Unlike" : "Like"}
          >
            <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={handleShare} 
            className="text-[#9D84C7] hover:text-[#F8F5F0] hover:scale-110 transition"
            title="Share"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="glass-card hover:bg-white/10 transition-all duration-500 p-4 rounded-2xl cursor-pointer group flex flex-col gap-4 relative min-w-[160px] max-w-[200px] flex-1 hover:shadow-[#FF3366]/10 hover:-translate-y-1.5"
      onClick={() => playSong(song)}
    >
      <div className="relative w-full aspect-square shadow-lg overflow-hidden rounded-xl">
        <img 
          src={song.thumbnailUrl} 
          alt={song.title} 
          className="w-full h-full object-cover shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500"></div>
        <div className={`absolute bottom-3 right-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ${isCurrentlyPlaying ? "opacity-100 translate-y-0" : ""}`}>
          <button 
            className="bg-[#FF3366] text-[#F8F5F0] rounded-full p-3.5 shadow-xl shadow-[#FF3366]/30 hover:scale-110 hover:bg-[#ff4d79] transition-all"
            onClick={handlePlayClick}
          >
            {isCurrentlyPlaying ? <Pause fill="currentColor" size={22} className="ml-0" /> : <Play fill="currentColor" size={22} className="ml-1" />}
          </button>
        </div>
        
        {/* Action Buttons */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-1.5" ref={menuRef}>
          <button 
            className="bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 hover:scale-110 transition-all backdrop-blur-md"
            onClick={toggleLike}
            title={isLiked ? "Unlike" : "Like"}
          >
            <Heart size={16} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "text-[#FF3366]" : "text-white"} />
          </button>
          <button 
            className="bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 hover:scale-110 transition-all backdrop-blur-md"
            onClick={handleShare}
            title="Share"
          >
            <Share2 size={16} />
          </button>
          <button 
            className="bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 hover:scale-110 transition-all backdrop-blur-md"
            onClick={toggleMenu}
            title="Add to Playlist"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex flex-col px-1">
        <h3 className={`font-semibold truncate text-base ${isCurrentSong ? "text-[#FF3366]" : "text-[#F8F5F0]"}`}>{song.title}</h3>
        <p className="text-[#9D84C7] text-sm truncate mt-0.5">{song.channelTitle}</p>
      </div>

      {menuContent}
    </div>
  );
}

