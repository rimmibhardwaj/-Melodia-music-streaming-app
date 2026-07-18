"use client";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

import { Play, Pause, SkipBack, SkipForward, Volume2, Plus, Heart, Share2, Mic2, Music } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { LyricsPanel } from "@/components/LyricsPanel";
import { NowPlayingView } from "@/components/NowPlayingView";
import { cleanTrackTitle } from "@/lib/cleanTrackTitle";
import { usePlayer } from "@/context/PlayerContext";
import { usePlaylists } from "@/hooks/usePlaylists";
import { useToast } from "@/context/ToastContext";
import { useDominantColor } from "@/hooks/useDominantColor";
const PlaylistMenu = ({ 
  playlists, 
  song, 
  addTrackToPlaylist, 
  removeTrackFromPlaylist, 
  closeMenu,
  menuPosition,
  menuContentRef
}: any) => {
  const curatedPlaylists = playlists.filter((p: any) => p.isCurated && p.id !== "liked_songs");
  const likedSongsPlaylist = playlists.find((p: any) => p.id === "liked_songs");
  const customPlaylists = playlists.filter((p: any) => !p.isCurated);
  const orderedPlaylists = [
    ...(likedSongsPlaylist ? [likedSongsPlaylist] : []),
    ...curatedPlaylists,
    ...customPlaylists
  ];

  const renderOption = (p: any) => {
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
        {orderedPlaylists.length === 0 ? (
          <div className="px-3 py-1 text-xs text-[#9D84C7] opacity-60 mb-1">No playlists created yet</div>
        ) : (
          <div className="mb-2">
            {orderedPlaylists.map(renderOption)}
          </div>
        )}
      </div>
    </div>
  );
};

export function PlayerBar() {
  const { currentSong, isPlaying, togglePlay, setIsPlaying, showLyrics, setShowLyrics } = usePlayer();
  const dominantColor = useDominantColor(currentSong?.thumbnailUrl);
  const { playlists, addTrackToPlaylist, removeTrackFromPlaylist } = usePlaylists();
  const { showToast } = useToast();
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showMenu, setShowMenu] = useState(false);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const playerRef = useRef<any>(null);
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = () => {
        console.log("YT API ready");
        initPlayer();
      };
    } else if (!playerRef.current) {
      initPlayer();
    }

    function initPlayer() {
      if (!document.getElementById('youtube-player')) return;
      
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '1',
        width: '1',
        videoId: currentSong?.id || '',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          playsinline: 1,
          rel: 0
        },
        events: {
          onReady: (event: any) => {
            setIsPlayerReady(true);
            event.target.setVolume(volume * 100);
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
            }
            if (event.data === window.YT.PlayerState.PLAYING) {
              const dur = event.target.getDuration();
              console.log("onStateChange PLAYING - getDuration():", dur);
              if (dur > 0) setDuration(dur);
            }
          }
        }
      });
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      setIsPlayerReady(false);
    };
  }, []); // Initialize once on mount

  useEffect(() => {
    if (isPlayerReady && playerRef.current && playerRef.current.loadVideoById && currentSong?.id) {
      // Avoid reloading if it's already the current video in the player
      const currentVideoId = playerRef.current.getVideoData?.().video_id;
      if (currentVideoId !== currentSong.id) {
        if (isPlaying) {
          playerRef.current.loadVideoById(currentSong.id);
        } else {
          playerRef.current.cueVideoById(currentSong.id);
        }
      }
    }
  }, [currentSong?.id, isPlayerReady]);

  useEffect(() => {
    if (isPlayerReady && playerRef.current && playerRef.current.playVideo) {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying, isPlayerReady]);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const currentTime = playerRef.current.getCurrentTime();
          let dur = 0;
          if (playerRef.current.getDuration) {
            dur = playerRef.current.getDuration();
          }
          console.log(`Playback interval - getCurrentTime(): ${currentTime}, getDuration(): ${dur}`);
          setProgress(currentTime);
          if (dur > 0 && dur !== duration) {
            setDuration(dur);
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        (!menuContentRef.current || !menuContentRef.current.contains(e.target as Node))
      ) {
        setShowMenu(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMenu(false);
        setShowLyrics(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Removed handleTimeUpdate since we use setInterval now

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(val * 100);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(val, true);
      setProgress(val);
    }
  };

  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const menuContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showMenu && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const menuWidth = 180;
      const estimatedHeight = 250;

      let top = rect.top - estimatedHeight + window.scrollY - 8;
      let left = rect.left + window.scrollX;

      setMenuPosition({ top, left });
    }
    setShowMenu(!showMenu);
  };

  const likedSongsPlaylist = playlists.find(p => p.id === "liked_songs");
  const isLiked = (currentSong ? likedSongsPlaylist?.tracks?.some(t => t.id === currentSong.id) : false) ?? false;

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentSong) return;
    if (isLiked) {
      removeTrackFromPlaylist("liked_songs", currentSong.id);
    } else {
      addTrackToPlaylist("liked_songs", currentSong);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentSong) return;
    const url = `${window.location.origin}/track/${currentSong.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentSong.title,
          text: `Check out ${currentSong.title} by ${currentSong.channelTitle} on MELODIA`,
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
    <>
      <div className="absolute opacity-0 pointer-events-none w-[1px] h-[1px] overflow-hidden">
        <div id="youtube-player" />
      </div>

      <div className="h-[90px] fixed bottom-0 left-0 right-0 z-50 border-t border-[#201633]">
        {/* Background Wrapper */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Ambient Glow Background Layer */}
          {currentSong && (
            <div 
              className="absolute inset-0 w-full h-full opacity-20 blur-3xl z-0 transition-colors duration-500 ease-in-out"
              style={{
                background: `radial-gradient(circle at 15% 50%, ${dominantColor} 0%, transparent 70%)`
              }}
            />
          )}
          {/* Glassmorphism Surface */}
          <div className="absolute inset-0 bg-[#140E1F]/70 backdrop-blur-xl z-0" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex items-center justify-between px-2 md:px-6 h-full w-full">
      
      {/* Left: Song Info */}
      {currentSong ? (
        <div className="flex items-center gap-2 md:gap-4 w-auto md:w-[30%] md:min-w-[180px] shrink-0">
          <img 
            src={currentSong.thumbnailUrl} 
            alt={currentSong.title} 
            onClick={() => setIsNowPlayingOpen(true)}
            className="w-10 h-10 md:w-14 md:h-14 rounded-md object-cover shadow-lg cursor-pointer hover:scale-105 transition-transform shrink-0"
          />
          
          {/* Mini Equalizer */}
          <div className={`hidden md:flex items-end gap-[2px] h-4 w-4 shrink-0 ${!isPlaying ? 'eq-paused' : ''}`}>
            <div className="eq-bar"></div>
            <div className="eq-bar"></div>
            <div className="eq-bar"></div>
            <div className="eq-bar"></div>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[#F8F5F0] text-xs md:text-sm font-semibold hover:underline cursor-pointer truncate max-w-[100px] md:max-w-[170px]">
              {currentSong.title}
            </span>
            <span className="text-[#9D84C7] text-[10px] md:text-xs hover:underline cursor-pointer mt-0.5 truncate hidden sm:block md:max-w-[170px]">
              {currentSong.channelTitle}
            </span>
          </div>
          
          {/* Playlist Menu */}
          <div className="hidden sm:flex items-center gap-2 ml-2" ref={menuRef}>
            <button 
              className={`transition hover:scale-110 ${isLiked ? "text-[#FF3366]" : "text-[#9D84C7] hover:text-[#FF3366]"}`}
              onClick={toggleLike}
              title={isLiked ? "Unlike" : "Like"}
            >
              <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
            </button>
            <button 
              className="text-[#9D84C7] hover:text-[#F8F5F0] hover:scale-110 transition"
              onClick={handleShare}
              title="Share"
            >
              <Share2 size={20} />
            </button>
            <button 
              className="text-[#9D84C7] hover:text-[#F8F5F0] hover:scale-110 transition ml-1"
              onClick={toggleMenu}
              title="Add to Playlist"
            >
              <Plus size={20} />
            </button>
            
            {showMenu && mounted && createPortal(
              <PlaylistMenu
                playlists={playlists}
                song={currentSong}
                addTrackToPlaylist={addTrackToPlaylist}
                removeTrackFromPlaylist={removeTrackFromPlaylist}
                closeMenu={() => setShowMenu(false)}
                menuPosition={menuPosition}
                menuContentRef={menuContentRef}
              />,
              document.body
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 md:gap-4 w-auto md:w-[30%] md:min-w-[180px] shrink-0">
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-md bg-[#282828] flex items-center justify-center shadow-lg shrink-0">
            <Music size={24} className="text-[#9D84C7]/50" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[#9D84C7]/70 text-xs md:text-sm font-semibold truncate max-w-[100px] md:max-w-[170px]">
              No track playing
            </span>
          </div>
        </div>
      )}

      {/* Middle: Controls */}
      {currentSong ? (
        <div className="flex flex-col items-center justify-center flex-1 md:w-[40%] md:max-w-[722px] px-2 md:px-0">
          <div className="flex items-center gap-3 md:gap-6 mb-1 md:mb-2">
            <button className="text-[#9D84C7] hover:text-[#F8F5F0] transition">
              <SkipBack size={18} fill="currentColor" className="md:w-5 md:h-5" />
            </button>
            
            <button 
              onClick={togglePlay}
              className="w-8 h-8 md:w-9 md:h-9 bg-[#FF3366] text-[#F8F5F0] shadow-lg shadow-[#FF3366]/20 rounded-full flex items-center justify-center hover:scale-105 hover:bg-[#ff4d79] transition-all"
            >
              {isPlaying ? <Pause size={14} fill="currentColor" className="md:w-4 md:h-4" /> : <Play size={14} fill="currentColor" className="ml-0.5 md:w-4 md:h-4" />}
            </button>
            
            <button className="text-[#9D84C7] hover:text-[#F8F5F0] transition">
              <SkipForward size={18} fill="currentColor" className="md:w-5 md:h-5" />
            </button>
          </div>
          
          {/* Progress */}
          <div className="flex items-center gap-2 md:gap-3 w-full text-[10px] md:text-xs font-medium text-[#9D84C7]">
            <span className="w-6 md:w-8 text-right">{formatTime(progress)}</span>
            <div className="flex-1 group flex items-center">
              <input 
                type="range" 
                min="0" 
                max={duration || 0} 
                value={progress} 
                onChange={handleSeek}
                style={{
                  background: `linear-gradient(to right, #FF3366 ${(progress / (duration || 1)) * 100}%, #32234f ${(progress / (duration || 1)) * 100}%)`
                }}
                className="w-full h-1 md:h-1.5 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 md:[&::-webkit-slider-thumb]:w-3.5 md:[&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-[#F8F5F0] hover:[&::-webkit-slider-thumb]:bg-[#FF3366] hover:[&::-webkit-slider-thumb]:scale-125 [&::-webkit-slider-thumb]:rounded-full cursor-pointer transition-all hover:[&::-webkit-slider-thumb]:shadow-[0_0_12px_#FF3366]"
              />
            </div>
            <span className="w-6 md:w-8 text-left">{formatTime(duration)}</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 md:w-[40%] md:max-w-[722px] px-2 md:px-0 opacity-40 pointer-events-none">
          <div className="flex items-center gap-3 md:gap-6 mb-1 md:mb-2">
            <button className="text-[#9D84C7] transition">
              <SkipBack size={18} fill="currentColor" className="md:w-5 md:h-5" />
            </button>
            <button className="w-8 h-8 md:w-9 md:h-9 bg-[#9D84C7] text-[#F8F5F0] rounded-full flex items-center justify-center transition-all">
              <Play size={14} fill="currentColor" className="ml-0.5 md:w-4 md:h-4" />
            </button>
            <button className="text-[#9D84C7] transition">
              <SkipForward size={18} fill="currentColor" className="md:w-5 md:h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 md:gap-3 w-full text-[10px] md:text-xs font-medium text-[#9D84C7]">
            <span className="w-6 md:w-8 text-right">0:00</span>
            <div className="flex-1 flex items-center">
              <div className="w-full h-1 md:h-1.5 rounded-full bg-[#32234f]" />
            </div>
            <span className="w-6 md:w-8 text-left">0:00</span>
          </div>
        </div>
      )}

      {/* Right: Volume */}
      <div className="hidden md:flex items-center justify-end gap-3 w-[30%] min-w-[180px] text-[#9D84C7] relative">
        <button 
          onClick={() => currentSong && setShowLyrics(!showLyrics)}
          className={`transition ${!currentSong ? "opacity-40 cursor-not-allowed" : showLyrics ? "text-[#FF3366] scale-110" : "hover:text-[#F8F5F0] hover:scale-110"}`}
          title="Lyrics"
        >
          <Mic2 size={20} />
        </button>
          <button className="hover:text-[#F8F5F0] transition ml-2">
            <Volume2 size={20} />
          </button>
          <div className="w-24 flex items-center group">
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume} 
              onChange={handleVolumeChange}
              style={{
                background: `linear-gradient(to right, #FF3366 ${volume * 100}%, #32234f ${volume * 100}%)`
              }}
              className="w-full h-1.5 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-[#F8F5F0] hover:[&::-webkit-slider-thumb]:bg-[#FF3366] hover:[&::-webkit-slider-thumb]:scale-125 [&::-webkit-slider-thumb]:rounded-full cursor-pointer transition-all hover:[&::-webkit-slider-thumb]:shadow-[0_0_12px_#FF3366]"
            />
          </div>
          </div>
          
        {/* Right Mobile: Just Lyrics */}
        <div className="flex md:hidden items-center justify-end gap-2 shrink-0 text-[#9D84C7]">
          <button 
            onClick={() => currentSong && setShowLyrics(!showLyrics)}
            className={`transition ${!currentSong ? "opacity-40 cursor-not-allowed" : showLyrics ? "text-[#FF3366]" : "hover:text-[#F8F5F0]"}`}
          >
            <Mic2 size={18} />
          </button>
        </div>
        
        {/* Lyrics Panel */}
        {currentSong && mounted && document.getElementById("lyrics-sidebar-root") && createPortal(
            <LyricsPanel 
              isOpen={showLyrics}
              onClose={() => setShowLyrics(false)}
              trackName={currentSong ? cleanTrackTitle(currentSong.title) : null}
              artistName={currentSong ? currentSong.channelTitle : null}
              duration={duration}
              currentTime={progress}
              videoId={currentSong ? currentSong.id : null}
              thumbnailUrl={currentSong ? currentSong.thumbnailUrl : null}
            />,
            document.getElementById("lyrics-sidebar-root")!
        )}
        
        {currentSong && mounted && createPortal(
          <NowPlayingView 
              isOpen={isNowPlayingOpen}
              onClose={() => setIsNowPlayingOpen(false)}
              currentSong={currentSong}
              isPlaying={isPlaying}
              progress={progress}
              duration={duration}
              volume={volume}
              isLiked={isLiked}
              togglePlay={togglePlay}
              handleSeek={handleSeek}
              handleVolumeChange={handleVolumeChange}
              toggleLike={toggleLike}
              handleShare={handleShare}
              formatTime={formatTime}
            />,
            document.body
          )}
      </div>
    </div>
    </>
  );
}
