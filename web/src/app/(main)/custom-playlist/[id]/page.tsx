"use client";

import { usePlaylists } from "@/hooks/usePlaylists";
import { useParams, useRouter } from "next/navigation";
import { SongCard } from "@/components/SongCard";
import { Trash2, Play, Share2 } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext";

export default function CustomPlaylist() {
  const { id } = useParams();
  const router = useRouter();
  const { playlists, isLoading, deletePlaylist } = usePlaylists();
  const { playSong } = usePlayer();
  const { showToast } = useToast();
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return <div className="p-6 text-gray-400">Loading playlist...</div>;
  }

  const playlist = playlists.find(p => p.id === id);

  if (!playlist) {
    return (
      <div className="p-6 pb-24 text-center mt-20">
        <h2 className="text-2xl font-bold text-white mb-4">Playlist not found</h2>
        <p className="text-gray-400">This playlist might have been deleted.</p>
        <button 
          onClick={() => router.push("/")}
          className="mt-6 bg-white text-black font-bold px-6 py-2 rounded-full hover:scale-105 transition"
        >
          Go Home
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
      deletePlaylist(playlist.id);
      router.push("/");
    }
  };

  const playAll = () => {
    if (playlist.tracks.length > 0) {
      // In a real app, you'd set a queue here. For now, just play the first track
      playSong(playlist.tracks[0]);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: playlist.name,
          text: `Listen to ${playlist.name} on MELODIA!`,
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

  return (
    <div className="p-6 pb-24">
      {/* Header */}
      <div className="flex items-end gap-6 mb-8 mt-10">
        <div className="w-48 h-48 bg-[#282828] shadow-2xl flex items-center justify-center rounded">
          {playlist.tracks.length > 0 ? (
            <div className="grid grid-cols-2 w-full h-full">
              {playlist.tracks.slice(0, 4).map((t, i) => (
                <img key={i} src={t.thumbnailUrl} className="w-full h-full object-cover" alt="" />
              ))}
              {/* Fill remaining slots if less than 4 */}
              {Array.from({ length: Math.max(0, 4 - playlist.tracks.length) }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-[#333] w-full h-full"></div>
              ))}
            </div>
          ) : (
            <span className="text-gray-500 font-bold">Empty</span>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-gray-400">Playlist</span>
          <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4">{playlist.name}</h1>
          <span className="text-sm text-gray-400">
            {playlist.tracks.length} {playlist.tracks.length === 1 ? 'song' : 'songs'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 mb-10">
        <button 
          onClick={playAll}
          disabled={playlist.tracks.length === 0}
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
        <button 
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-500 transition hover:scale-110 ml-2"
          title="Delete Playlist"
        >
          <Trash2 size={24} />
        </button>
      </div>

      {/* Tracks */}
      <div>
        {playlist.tracks.length === 0 ? (
          <div className="text-gray-400 italic text-center py-20">
            No tracks in this playlist yet. Browse songs and use the menu to add them here!
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {playlist.tracks.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
