import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const playlists = await db.getPlaylists();
    return NextResponse.json(playlists);
  } catch (error) {
    console.error("[Playlists API] Error fetching playlists:", error);
    return NextResponse.json({ error: "Failed to fetch playlists" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action, playlistId, name, track, trackId, playlists: migratedPlaylists } = await request.json();
    const playlists = await db.getPlaylists();

    if (action === "create") {
      const newPlaylist = {
        id: `playlist_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name,
        tracks: [],
        createdAt: Date.now(),
      };
      playlists.push(newPlaylist);
      await db.savePlaylists(playlists);
      return NextResponse.json(newPlaylist);
    } 
    else if (action === "migrate" && migratedPlaylists) {
      await db.savePlaylists(migratedPlaylists);
      return NextResponse.json({ success: true });
    }
    
    else if (action === "delete") {
      const target = playlists.find(p => p.id === playlistId);
      // We no longer block deleting curated playlists
      const updatedPlaylists = playlists.filter(p => p.id !== playlistId);
      await db.savePlaylists(updatedPlaylists);
      return NextResponse.json({ success: true });
    }
    
    else if (action === "addTrack") {
      console.log("[Playlists API] addTrack called for", playlistId, "with track", track?.title);
      const targetIndex = playlists.findIndex(p => p.id === playlistId);
      if (targetIndex === -1) {
        console.log("[Playlists API] Playlist not found:", playlistId);
        return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
      }
      
      const targetPlaylist = playlists[targetIndex];
      // Prevent duplicates
      const isDuplicate = targetPlaylist.tracks.find(t => t.id === track.id);
      if (!isDuplicate) {
        targetPlaylist.tracks.push(track);
        playlists[targetIndex] = targetPlaylist;
        await db.savePlaylists(playlists);
        console.log("[Playlists API] Track added successfully to", playlistId, "Total tracks:", targetPlaylist.tracks.length);
      } else {
        console.log("[Playlists API] Track is a duplicate:", track.id);
      }
      return NextResponse.json(targetPlaylist);
    }
    
    else if (action === "removeTrack") {
      const targetIndex = playlists.findIndex(p => p.id === playlistId);
      if (targetIndex === -1) return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
      
      const targetPlaylist = playlists[targetIndex];
      targetPlaylist.tracks = targetPlaylist.tracks.filter(t => t.id !== trackId);
      playlists[targetIndex] = targetPlaylist;
      await db.savePlaylists(playlists);
      return NextResponse.json(targetPlaylist);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("[Playlists API] Error mutating playlists:", error);
    return NextResponse.json({ error: "Failed to mutate playlists" }, { status: 500 });
  }
}
