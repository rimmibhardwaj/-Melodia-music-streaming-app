import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { Playlist, Song } from "@/types";

export const dynamic = 'force-dynamic';

async function getPopulatedPlaylists(): Promise<Playlist[]> {
  let allPlaylists = await db.select().from(schema.playlists);
  
  // Seed default curated playlists if DB is completely empty
  if (allPlaylists.length === 0) {
    const DEFAULT_PLAYLISTS = [
      { id: "liked_songs", name: "Liked Songs", isCurated: true },
      { id: "curated_chill_vibes", name: "Chill Vibes", isCurated: true },
      { id: "curated_discover_weekly", name: "Discover Weekly", isCurated: true },
      { id: "curated_release_radar", name: "Release Radar", isCurated: true },
      { id: "curated_deep_focus", name: "Deep Focus", isCurated: true },
      { id: "curated_coding_mix", name: "Coding Mix", isCurated: true },
      { id: "curated_weekend_hangouts", name: "Weekend Hangouts", isCurated: true },
    ];
    
    for (const p of DEFAULT_PLAYLISTS) {
      await db.insert(schema.playlists).values({
        id: p.id,
        name: p.name,
        userId: null,
        createdAt: Date.now(),
        isCurated: p.isCurated,
      }).onConflictDoNothing();
    }
    allPlaylists = await db.select().from(schema.playlists);
  }

  const allSongs = await db.select().from(schema.songs);
  const allJoins = await db.select().from(schema.playlistSongs);

  return allPlaylists.map(p => {
    // Sort joins by addedAt
    const joins = allJoins.filter(j => j.playlistId === p.id).sort((a, b) => a.addedAt - b.addedAt);
    const tracks = joins.map(j => allSongs.find(s => s.id === j.songId)).filter(Boolean) as Song[];
    
    return {
      id: p.id,
      name: p.name,
      userId: p.userId || undefined,
      createdAt: p.createdAt,
      isCurated: p.isCurated,
      tracks
    };
  });
}

export async function GET() {
  try {
    const playlists = await getPopulatedPlaylists();
    return NextResponse.json(playlists);
  } catch (error) {
    console.error("[Playlists API] Error fetching playlists:", error);
    return NextResponse.json({ error: "Failed to fetch playlists" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action, playlistId, name, track, trackId, playlists: migratedPlaylists, userId } = await request.json();

    if (action === "create") {
      console.log(`[Playlists API] Creating playlist: ${name} for user: ${userId}`);
      if (!userId) {
        console.warn("[Playlists API] Warning: userId is missing when creating a playlist.");
      }
      
      const newPlaylist = {
        id: `playlist_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name,
        userId: userId || null,
        createdAt: Date.now(),
        isCurated: false,
      };
      
      await db.insert(schema.playlists).values(newPlaylist);
      
      return NextResponse.json({
        ...newPlaylist,
        tracks: []
      });
    } 
    
    else if (action === "migrate" && migratedPlaylists) {
      // Clear all existing data
      await db.delete(schema.playlistSongs);
      await db.delete(schema.playlists);
      await db.delete(schema.songs);
      
      for (const p of migratedPlaylists) {
        await db.insert(schema.playlists).values({
          id: p.id,
          name: p.name,
          userId: p.userId || null,
          createdAt: p.createdAt,
          isCurated: p.isCurated || false,
        });
        
        for (const t of p.tracks) {
          // Upsert song
          await db.insert(schema.songs).values({
            id: t.id,
            title: t.title,
            channelTitle: t.channelTitle,
            thumbnailUrl: t.thumbnailUrl,
            duration: t.duration,
            audioUrl: t.audioUrl || null,
          }).onConflictDoNothing();
          
          await db.insert(schema.playlistSongs).values({
            playlistId: p.id,
            songId: t.id,
            addedAt: Date.now()
          }).onConflictDoNothing();
        }
      }
      
      return NextResponse.json({ success: true });
    }
    
    else if (action === "delete") {
      await db.delete(schema.playlists).where(eq(schema.playlists.id, playlistId));
      return NextResponse.json({ success: true });
    }
    
    else if (action === "addTrack") {
      console.log("[Playlists API] addTrack called for", playlistId, "with track", track?.title);
      
      const existingPlaylist = await db.select().from(schema.playlists).where(eq(schema.playlists.id, playlistId));
      if (existingPlaylist.length === 0) {
        console.log("[Playlists API] Playlist not found:", playlistId);
        return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
      }
      
      // Upsert song
      await db.insert(schema.songs).values({
        id: track.id,
        title: track.title,
        channelTitle: track.channelTitle,
        thumbnailUrl: track.thumbnailUrl,
        duration: track.duration,
        audioUrl: track.audioUrl || null,
      }).onConflictDoNothing();
      
      // Add to playlist
      await db.insert(schema.playlistSongs).values({
        playlistId: playlistId,
        songId: track.id,
        addedAt: Date.now()
      }).onConflictDoNothing();
      
      // Re-fetch populated playlist to return exact shape
      const playlists = await getPopulatedPlaylists();
      const targetPlaylist = playlists.find(p => p.id === playlistId);
      
      console.log("[Playlists API] Track added successfully to", playlistId, "Total tracks:", targetPlaylist?.tracks.length);
      return NextResponse.json(targetPlaylist);
    }
    
    else if (action === "removeTrack") {
      await db.delete(schema.playlistSongs)
        .where(and(
          eq(schema.playlistSongs.playlistId, playlistId),
          eq(schema.playlistSongs.songId, trackId)
        ));
        
      const playlists = await getPopulatedPlaylists();
      const targetPlaylist = playlists.find(p => p.id === playlistId);
      if (!targetPlaylist) return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
      
      return NextResponse.json(targetPlaylist);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("[Playlists API] Error mutating playlists:", error);
    return NextResponse.json({ error: "Failed to mutate playlists" }, { status: 500 });
  }
}
