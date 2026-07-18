"use client";

import { Home, Search, Library, Plus, Heart, Music, Trash2, Compass, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { usePlaylists } from "@/hooks/usePlaylists";
import { useState } from "react";
import { PlaylistMosaic } from "./PlaylistMosaic";

const GRADIENTS = [
  "from-pink-500 to-rose-500",
  "from-purple-500 to-violet-600",
  "from-fuchsia-800 to-fuchsia-500",
  "from-purple-800 to-indigo-600",
  "from-amber-500 to-orange-500"
];

export function EmptyPlaylistIcon({ name }: { name: string }) {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradient = GRADIENTS[hash % GRADIENTS.length];
  
  return (
    <div className={`w-8 h-8 rounded-md bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-sm`}>
      <Music size={16} className="text-white/60 drop-shadow-sm" />
    </div>
  );
}

export function Sidebar({ 
  isMobileOpen = false, 
  onClose 
}: { 
  isMobileOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { playlists, createPlaylist, deletePlaylist } = usePlaylists();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const handleCreatePlaylist = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      try {
        console.log("Creating playlist with name:", newPlaylistName.trim());
        await createPlaylist(newPlaylistName.trim());
        console.log("Playlist created successfully");
        setNewPlaylistName("");
        setIsCreating(false);
      } catch (error) {
        console.error("Failed to create playlist:", error);
      }
    }
  };

  const curatedPlaylists = playlists.filter(p => p.isCurated && p.id !== "liked_songs");
  const likedSongsPlaylist = playlists.find(p => p.id === "liked_songs");
  const customPlaylists = playlists.filter(p => !p.isCurated);

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 w-[240px] glass-panel flex-shrink-0 flex-col h-[100dvh] md:h-[calc(100vh-90px)] md:overflow-hidden
        transition-transform duration-300 md:relative md:flex md:translate-x-0
        ${isMobileOpen ? 'translate-x-0 flex' : '-translate-x-full hidden md:flex'}
      `}>
        {/* Top Nav */}
        <div className="p-6 pb-2">
          <div className="flex items-center justify-between mb-8">
            <Link href="/">
              <h1 className="text-2xl font-bold text-[#FF3366] cursor-pointer hover:text-[#ff4d79] transition tracking-tight font-display">MELODIA</h1>
            </Link>
            <button 
              className="md:hidden text-gray-400 hover:text-white transition-colors"
              onClick={onClose}
            >
              <X size={24} />
            </button>
          </div>
          
        <nav className="flex flex-col gap-2 font-semibold">
          <Link href="/" className={`flex items-center gap-4 cursor-pointer transition-all duration-200 rounded-full py-2.5 px-4 ${pathname === "/" ? "bg-[#FF3366] text-white shadow-md" : "text-[#9D84C7] hover:bg-white/5 hover:text-[#F8F5F0]"}`}>
            <Home size={24} />
            <span>Home</span>
          </Link>
          <Link href="/search" className={`flex items-center gap-4 cursor-pointer transition-all duration-200 rounded-full py-2.5 px-4 ${pathname === "/search" ? "bg-[#FF3366] text-white shadow-md" : "text-[#9D84C7] hover:bg-white/5 hover:text-[#F8F5F0]"}`}>
            <Search size={24} />
            <span>Search</span>
          </Link>
          <Link href="/explore" className={`flex items-center gap-4 cursor-pointer transition-all duration-200 rounded-full py-2.5 px-4 ${pathname === "/explore" ? "bg-[#FF3366] text-white shadow-md" : "text-[#9D84C7] hover:bg-white/5 hover:text-[#F8F5F0]"}`}>
            <Compass size={24} />
            <span>Explore</span>
          </Link>
        </nav>
      </div>

      <div className="mx-6 my-4 border-t border-[#201633]"></div>

      {/* Playlists */}
      <div className="flex-1 overflow-y-auto min-h-0 px-6 py-2 scrollbar-hide [-webkit-overflow-scrolling:touch]">
        <div className="flex flex-col gap-3 text-[#9D84C7] text-sm font-medium">
          <div className="flex items-center justify-between text-[#9D84C7] text-xs uppercase tracking-wider font-semibold mb-1 font-display">
            <span>Your Playlists</span>
            <button 
              onClick={() => setIsCreating(true)}
              className="hover:text-[#FF3366] transition"
              title="Create Playlist"
            >
              <Plus size={16} />
            </button>
          </div>

          {isCreating && (
            <form onSubmit={handleCreatePlaylist} className="mt-1 mb-2">
              <input
                type="text"
                autoFocus
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreatePlaylist(e);
                  }
                }}
                onBlur={() => {
                  if (!newPlaylistName.trim()) setIsCreating(false);
                }}
                placeholder="Playlist name..."
                className="w-full bg-[#201633] text-[#F8F5F0] text-sm rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-[#FF3366]"
              />
            </form>
          )}

          {likedSongsPlaylist && (
            <Link
              href={`/playlist/${encodeURIComponent(likedSongsPlaylist.name)}`}
              className={`flex items-center gap-3 hover:text-[#F8F5F0] cursor-pointer transition ${pathname === `/playlist/${encodeURIComponent(likedSongsPlaylist.name)}` ? "text-[#F8F5F0] font-medium" : ""}`}
            >
              <div className="bg-gradient-to-br from-[#FF3366] to-[#9D84C7] p-1.5 rounded-sm flex items-center justify-center">
                <Heart size={14} fill="currentColor" className="text-white" />
              </div>
              <span>Liked Songs</span>
            </Link>
          )}

          {curatedPlaylists.map((playlist) => {
            const playlistPath = `/playlist/${encodeURIComponent(playlist.name)}`;
            const isActive = pathname === playlistPath;
            const isEmpty = !playlist.tracks || playlist.tracks.length === 0;
            return (
              <Link 
                key={playlist.id} 
                href={playlistPath}
                className={`flex items-center gap-3 hover:text-[#F8F5F0] cursor-pointer transition group ${isActive ? "text-[#F8F5F0] font-medium" : ""}`}
              >
                {isEmpty ? (
                  <EmptyPlaylistIcon name={playlist.name} />
                ) : (
                  <PlaylistMosaic tracks={playlist.tracks} name={playlist.name} />
                )}
                <span className="truncate flex-1">{playlist.name}</span>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    if (confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
                      deletePlaylist(playlist.id);
                      if (isActive) {
                        router.push("/");
                      }
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition p-1"
                  title="Delete Playlist"
                >
                  <Trash2 size={16} />
                </button>
              </Link>
            );
          })}

          {customPlaylists.map((playlist) => {
            const playlistPath = `/custom-playlist/${playlist.id}`;
            const isActive = pathname === playlistPath;
            const isEmpty = !playlist.tracks || playlist.tracks.length === 0;
            return (
              <Link 
                key={playlist.id} 
                href={playlistPath}
                className={`flex items-center gap-3 hover:text-[#F8F5F0] cursor-pointer transition group ${isActive ? "text-[#F8F5F0] font-medium" : ""}`}
              >
                {isEmpty ? (
                  <EmptyPlaylistIcon name={playlist.name} />
                ) : (
                  <PlaylistMosaic tracks={playlist.tracks} name={playlist.name} />
                )}
                <span className="truncate flex-1">{playlist.name}</span>
                <button 
                  onClick={(e) => {
                    e.preventDefault(); // Prevent navigating to the playlist
                    if (confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
                      deletePlaylist(playlist.id);
                      if (isActive) {
                        router.push("/");
                      }
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition p-1"
                  title="Delete Playlist"
                >
                  <Trash2 size={16} />
                </button>
              </Link>
            );
          })}
        </div>
      </div>
      </div>
    </>
  );
}
