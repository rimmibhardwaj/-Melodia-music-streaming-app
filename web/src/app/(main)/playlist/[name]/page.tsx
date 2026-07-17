"use client";

import { SongCard } from "@/components/SongCard";
import { use, useState, useEffect } from "react";
import { usePlaylists } from "@/hooks/usePlaylists";
import { Song } from "@/types";
import { Play, Share2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/context/PlayerContext";
import { useToast } from "@/context/ToastContext";

// Mapping of curated playlist names to Jamendo API parameters
const PLAYLIST_CONFIGS: Record<string, { tags?: string; order?: string; randomizeOffset?: boolean }> = {
  "Chill Vibes": { tags: "chill,lofi,ambient", order: "popularity_week" },
  "Discover Weekly": { order: "popularity_week", randomizeOffset: true }, // Simulate random popular mix
  "Release Radar": { order: "releasedate_desc" },
  "Deep Focus": { tags: "instrumental,ambient,focus", order: "popularity_week" },
  "Coding Mix": { tags: "electronic,instrumental,lofi", order: "popularity_week" },
  "Weekend Hangouts": { tags: "upbeat,pop,party", order: "popularity_week" },
};

export default function Playlist({ params }: { params: Promise<{ name: string }> }) {
  const resolvedParams = use(params);
  const decodedName = decodeURIComponent(resolvedParams.name);
  
  const config = PLAYLIST_CONFIGS[decodedName] || { order: "popularity_week" };
  
  const [randomOffset, setRandomOffset] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const { playlists, isLoading: playlistsLoading, deletePlaylist } = usePlaylists();
  const { playSong } = usePlayer();
  const router = useRouter();
  const { showToast } = useToast();
  
  // Find the specific curated playlist in local storage
  const localCuratedPlaylist = playlists.find(p => p.name === decodedName && p.isCurated);

  useEffect(() => {
    setMounted(true);
    if (config.randomizeOffset) {
      setRandomOffset(Math.floor(Math.random() * 50));
    } else {
      setRandomOffset(0);
    }
  }, [config.randomizeOffset]);

  if (!mounted || playlistsLoading) {
    return <div className="p-6 text-gray-400">Loading playlist...</div>;
  }

  if (!localCuratedPlaylist) {
    return (
      <div className="p-6 pb-24 text-center mt-20">
        <h2 className="text-2xl font-bold text-white mb-4">Playlist not found</h2>
        <p className="text-gray-400">This playlist might have been deleted or does not exist.</p>
        <button 
          onClick={() => router.push("/")}
          className="mt-6 bg-white text-black font-bold px-6 py-2 rounded-full hover:scale-105 transition"
        >
          Go Home
        </button>
      </div>
    );
  }

  const mergedSongs = localCuratedPlaylist?.tracks || [];

  const isLoading = false;
  const error = null;

  // Skeleton loader for grid
  const SkeletonCard = () => (
    <div className="animate-pulse bg-[#181818] rounded-xl p-4 min-w-[160px] max-w-[200px] aspect-square flex flex-col gap-4">
      <div className="w-full aspect-square bg-[#282828] rounded-md"></div>
      <div className="flex flex-col gap-2">
        <div className="h-4 bg-[#282828] rounded w-3/4"></div>
        <div className="h-3 bg-[#282828] rounded w-1/2"></div>
      </div>
    </div>
  );

  const playAll = () => {
    if (mergedSongs.length > 0) {
      playSong(mergedSongs[0]);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: decodedName,
          text: `Listen to ${decodedName} on MELODIA!`,
          url: url,
        });
      } catch (err) {
        navigator.clipboard.writeText(url);
        showToast("Playlist link copied to clipboard!");
      }
    } else {
      navigator.clipboard.writeText(url);
      showToast("Playlist link copied to clipboard!");
    }
  };

  const handleDelete = () => {
    if (localCuratedPlaylist && confirm(`Are you sure you want to delete "${decodedName}"?`)) {
      deletePlaylist(localCuratedPlaylist.id);
      router.push("/");
    }
  };

  return (
    <div className="p-6 pb-24">
      {/* Header */}
      <div className="flex items-end gap-6 mb-10 mt-6">
        <div className="w-48 h-48 bg-gradient-to-br from-[#1DB954] to-black shadow-2xl flex items-center justify-center rounded">
          <span className="text-white text-5xl font-bold opacity-50">#</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Curated Playlist</span>
          <h1 className="text-5xl font-extrabold text-white tracking-tight mb-2">{decodedName}</h1>
          <span className="text-sm text-gray-400">
            A hand-picked selection of tracks for {decodedName.toLowerCase()}.
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 mb-10">
        <button 
          onClick={playAll}
          disabled={mergedSongs.length === 0}
          className="bg-[#1DB954] text-black rounded-full p-4 hover:scale-105 hover:bg-[#1ed760] transition disabled:opacity-50 disabled:hover:scale-100 shadow-[0_8px_20px_rgba(29,185,84,0.3)]"
          title="Play"
        >
          <Play fill="currentColor" size={28} className="ml-1" />
        </button>
        <button 
          onClick={handleShare}
          className="text-gray-400 hover:text-white transition hover:scale-110"
          title="Share Playlist"
        >
          <Share2 size={24} />
        </button>
        {localCuratedPlaylist && (
          <button 
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-500 transition hover:scale-110 ml-2"
            title="Delete Playlist"
          >
            <Trash2 size={24} />
          </button>
        )}
      </div>

      {error && (
        <div className="text-red-400 p-4 bg-red-900/20 rounded-md border border-red-500/50 mb-6">
          Error loading tracks: {error}
        </div>
      )}

      {/* Tracks */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {(isLoading || randomOffset === null) ? (
          Array.from({ length: 15 }).map((_, i) => <SkeletonCard key={i} />)
        ) : mergedSongs.length > 0 ? (
          mergedSongs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))
        ) : (
          !error && <div className="text-gray-400 italic col-span-full">No tracks found.</div>
        )}
      </div>
    </div>
  );
}


