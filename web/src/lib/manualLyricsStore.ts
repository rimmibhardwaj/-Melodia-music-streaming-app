import fs from "fs/promises";
import path from "path";

// NOTE: This uses a local JSON file, which works for local dev but will
// NOT persist on serverless hosts (Vercel, etc.) since the filesystem
// resets on each deploy/cold start. Before deploying to production,
// swap this out for your real database (same one you use for 
// playlists/likes) — keep the function signatures the same so nothing
// else needs to change.

const STORE_PATH = path.join(process.cwd(), "data", "manual-lyrics.json");

interface ManualLyricsStore {
  [videoId: string]: string; // plain lyrics text
}

async function readStore(): Promise<ManualLyricsStore> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeStore(store: ManualLyricsStore): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export async function getManualLyrics(videoId: string): Promise<string | null> {
  const store = await readStore();
  return store[videoId] ?? null;
}

export async function saveManualLyrics(
  videoId: string,
  lyrics: string
): Promise<void> {
  const store = await readStore();
  store[videoId] = lyrics;
  await writeStore(store);
}
