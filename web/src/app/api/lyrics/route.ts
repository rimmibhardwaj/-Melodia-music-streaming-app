import { NextRequest, NextResponse } from "next/server";
import { generateQueryVariants } from "@/lib/cleanTrackTitle";
import { fetchMusixmatchLyrics } from "@/lib/musixmatch";
import { getManualLyrics } from "@/lib/manualLyricsStore";
import { fetchGeniusLyrics } from "@/lib/genius";

const LRCLIB_BASE = "https://lrclib.net/api";

export interface LyricLine {
  time: number;
  text: string;
}

export interface LyricsResponse {
  synced: LyricLine[] | null;
  plain: string | null;
  source: "manual" | "lrclib" | "genius" | "musixmatch" | "none";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  // Also check title for backward compatibility if needed
  const rawTitle = searchParams.get("track") || searchParams.get("title");
  const artistName = searchParams.get("artist");
  const duration = searchParams.get("duration");
  const videoId = searchParams.get("videoId");

  if (!rawTitle || !artistName) {
    return NextResponse.json(
      { error: "track and artist are required" },
      { status: 400 }
    );
  }

  // 1. Check manual overrides first — fastest, free, and user-curated
  if (videoId) {
    const manual = await getManualLyrics(videoId);
    if (manual) {
      return NextResponse.json({
        synced: null,
        plain: manual,
        source: "manual",
      } satisfies LyricsResponse);
    }
  }

  // 2. Try lrclib with progressively looser query variants
  const variants = generateQueryVariants(rawTitle, artistName);

  for (const variant of variants) {
    const result = await tryLrclib(variant.track, variant.artist, duration);
    if (result) {
      return NextResponse.json({
        ...result,
        source: "lrclib",
      } satisfies LyricsResponse);
    }
  }

  // 3. Fall back to Genius (excellent for plain text lyrics)
  const geniusResult = await fetchGeniusLyrics(variants[0].track, artistName);
  if (geniusResult.plain) {
    return NextResponse.json({
      synced: null,
      plain: geniusResult.plain,
      source: "genius", // Note: Need to add 'genius' to LyricsResponse source type
    } satisfies any); 
  }

  // 4. Fall back to Musixmatch (plain text only, last resort)
  const musixmatchResult = await fetchMusixmatchLyrics(
    variants[0].track,
    artistName
  );
  if (musixmatchResult.plain) {
    return NextResponse.json({
      synced: null,
      plain: musixmatchResult.plain,
      source: "musixmatch",
    } satisfies any);
  }

  // 5. Nothing found anywhere
  return NextResponse.json({
    synced: null,
    plain: null,
    source: "none",
  } satisfies any);
}

async function tryLrclib(
  track: string,
  artist: string,
  duration: string | null
): Promise<{ synced: LyricLine[] | null; plain: string | null } | null> {
  try {
    if (artist) {
      const getUrl = new URL(`${LRCLIB_BASE}/get`);
      getUrl.searchParams.set("track_name", track);
      getUrl.searchParams.set("artist_name", artist);
      if (duration) getUrl.searchParams.set("duration", duration);

      const exactRes = await fetch(getUrl.toString());
      if (exactRes.ok) {
        const data = await exactRes.json();
        const parsed = formatLyrics(data);
        if (parsed.synced || parsed.plain) return parsed;
      }
    }

    // Fuzzy search fallback (also used for title-only variant)
    const searchUrl = new URL(`${LRCLIB_BASE}/search`);
    searchUrl.searchParams.set("track_name", track);
    if (artist) searchUrl.searchParams.set("artist_name", artist);

    const searchRes = await fetch(searchUrl.toString(), {
      headers: {
        'User-Agent': 'Melodia Music Player (https://github.com/melodia/melodia)'
      }
    });
    if (!searchRes.ok) return null;

    const results = await searchRes.json();
    if (!Array.isArray(results) || results.length === 0) return null;

    const parsed = formatLyrics(results[0]);
    return parsed.synced || parsed.plain ? parsed : null;
  } catch (error) {
    console.error("lrclib fetch error:", error);
    return null;
  }
}

function formatLyrics(data: any): { synced: LyricLine[] | null; plain: string | null } {
  const syncedRaw: string | null = data?.syncedLyrics ?? null;
  const plain: string | null = data?.plainLyrics ?? null;

  return {
    synced: syncedRaw ? parseLRC(syncedRaw) : null,
    plain,
  };
}

function parseLRC(lrc: string): LyricLine[] {
  const lines = lrc.split("\n");
  const parsed: LyricLine[] = [];
  const timeTagRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

  for (const line of lines) {
    const matches = [...line.matchAll(timeTagRegex)];
    if (matches.length === 0) continue;

    const text = line.replace(timeTagRegex, "").trim();
    if (!text) continue;

    for (const match of matches) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const ms = parseInt(match[3].padEnd(3, "0"), 10);
      parsed.push({ time: minutes * 60 + seconds + ms / 1000, text });
    }
  }

  return parsed.sort((a, b) => a.time - b.time);
}