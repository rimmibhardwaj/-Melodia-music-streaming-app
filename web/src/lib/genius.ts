import { getLyrics, getSong } from "genius-lyrics-api";

export interface GeniusLyricsResult {
  plain: string | null;
}

export async function fetchGeniusLyrics(
  track: string,
  artist: string
): Promise<GeniusLyricsResult> {
  const apiKey = process.env.GENIUS_API_KEY;
  if (!apiKey) {
    console.warn("GENIUS_API_KEY not set, skipping Genius fallback");
    return { plain: null };
  }

  const options = {
    apiKey: apiKey,
    title: track,
    artist: artist || "",
    optimizeQuery: true, // This automatically cleans up titles (removes (Official Video) etc)
  };

  try {
    // If we only need lyrics:
    const lyrics = await getLyrics(options);
    
    if (lyrics && lyrics.length > 0) {
      return { plain: lyrics };
    }
    
    return { plain: null };
  } catch (error) {
    console.error("Genius fetch error:", error);
    return { plain: null };
  }
}
