import { useState, useEffect, useCallback } from "react";
import { Song, Playlist } from "@/types";

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPlaylists = useCallback(async () => {
    try {
      const res = await fetch("/api/playlists", { cache: "no-store" });
      if (res.ok) {
        let data = await res.json();
        
        // Migrate old localStorage data if present
        const oldLocalData = localStorage.getItem("melodia_custom_playlists");
        if (oldLocalData && data.length <= 7) { // 7 is the default curated count
          try {
            const parsedOldData = JSON.parse(oldLocalData);
            if (Array.isArray(parsedOldData) && parsedOldData.length > 0) {
              // Post migration payload
              await fetch("/api/playlists", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "migrate", playlists: parsedOldData }),
              });
              data = parsedOldData;
              localStorage.removeItem("melodia_custom_playlists"); // Clear after migrating
            }
          } catch (e) {
            console.error("Migration error:", e);
          }
        }
        
        setPlaylists(data);
      }
    } catch (err) {
      console.error("Failed to load playlists", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlaylists();

    const handleLocalUpdate = () => {
      loadPlaylists();
    };

    window.addEventListener("playlistsUpdated", handleLocalUpdate);

    return () => {
      window.removeEventListener("playlistsUpdated", handleLocalUpdate);
    };
  }, [loadPlaylists]);

  const dispatchUpdate = () => {
    window.dispatchEvent(new Event("playlistsUpdated"));
  };

  const createPlaylist = useCallback(async (name: string) => {
    try {
      const res = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", name }),
      });
      if (res.ok) {
        const newPlaylist = await res.json();
        setPlaylists(prev => [...prev, newPlaylist]);
        dispatchUpdate();
        return newPlaylist.id;
      }
    } catch (err) {
      console.error("Failed to create playlist", err);
    }
  }, []);

  const deletePlaylist = useCallback(async (id: string) => {
    try {
      const target = playlists.find(p => p.id === id);
      
      const res = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", playlistId: id }),
      });
      if (res.ok) {
        setPlaylists(prev => prev.filter(p => p.id !== id));
        dispatchUpdate();
      }
    } catch (err) {
      console.error("Failed to delete playlist", err);
    }
  }, [playlists]);

  const addTrackToPlaylist = useCallback(async (playlistId: string, track: Song) => {
    try {
      // Optimistic update
      setPlaylists(prev => prev.map(p => {
        if (p.id === playlistId && !p.tracks.find(t => t.id === track.id)) {
          return { ...p, tracks: [...p.tracks, track] };
        }
        return p;
      }));

      const res = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addTrack", playlistId, track }),
      });
      if (res.ok) {
        dispatchUpdate();
      }
    } catch (err) {
      console.error("Failed to add track", err);
    }
  }, []);

  const removeTrackFromPlaylist = useCallback(async (playlistId: string, trackId: string) => {
    try {
      // Optimistic update
      setPlaylists(prev => prev.map(p => {
        if (p.id === playlistId) {
          return { ...p, tracks: p.tracks.filter(t => t.id !== trackId) };
        }
        return p;
      }));

      const res = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "removeTrack", playlistId, trackId }),
      });
      if (res.ok) {
        dispatchUpdate();
      }
    } catch (err) {
      console.error("Failed to remove track", err);
    }
  }, []);

  return { 
    playlists, 
    isLoading, 
    createPlaylist, 
    deletePlaylist, 
    addTrackToPlaylist, 
    removeTrackFromPlaylist 
  };
}
