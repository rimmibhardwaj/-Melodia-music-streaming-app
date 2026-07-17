import fs from 'fs/promises';
import path from 'path';
import { Playlist, Song } from '@/types';

// The path where the database JSON file will be stored
const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

interface DatabaseSchema {
  playlists: Playlist[];
  apiCache: Record<string, { data: any; timestamp: number }>;
}

const DEFAULT_DB: DatabaseSchema = {
  playlists: [
    { id: "liked_songs", name: "Liked Songs", tracks: [], createdAt: 0, isCurated: true },
    { id: "curated_chill_vibes", name: "Chill Vibes", tracks: [], createdAt: 0, isCurated: true },
    { id: "curated_discover_weekly", name: "Discover Weekly", tracks: [], createdAt: 0, isCurated: true },
    { id: "curated_release_radar", name: "Release Radar", tracks: [], createdAt: 0, isCurated: true },
    { id: "curated_deep_focus", name: "Deep Focus", tracks: [], createdAt: 0, isCurated: true },
    { id: "curated_coding_mix", name: "Coding Mix", tracks: [], createdAt: 0, isCurated: true },
    { id: "curated_weekend_hangouts", name: "Weekend Hangouts", tracks: [], createdAt: 0, isCurated: true },
  ],
  apiCache: {}
};

// Internal helper to get/initialize the database
async function getDb(): Promise<DatabaseSchema> {
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data) as DatabaseSchema;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // Create data directory if it doesn't exist
      await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
      // Create default db
      await fs.writeFile(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2));
      return DEFAULT_DB;
    }
    throw error;
  }
}

// Internal helper to save the database
async function saveDb(data: DatabaseSchema): Promise<void> {
  await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

export const db = {
  // Playlist methods
  async getPlaylists(): Promise<Playlist[]> {
    const data = await getDb();
    
    // We used to auto-repair curated playlists here, but now users can freely delete them
    
    return data.playlists;
  },

  async savePlaylists(playlists: Playlist[]): Promise<void> {
    const data = await getDb();
    data.playlists = playlists;
    await saveDb(data);
  },

  // API Cache methods
  async getCacheItem(key: string): Promise<{ data: any; timestamp: number } | null> {
    const data = await getDb();
    return data.apiCache[key] || null;
  },

  async setCacheItem(key: string, value: any): Promise<void> {
    const data = await getDb();
    data.apiCache[key] = { data: value, timestamp: Date.now() };
    await saveDb(data);
  }
};
