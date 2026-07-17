const MUSIXMATCH_BASE = "https://api.musixmatch.com/ws/1.1";

export interface MusixmatchLyricsResult {
  plain: string | null;
}

export async function fetchMusixmatchLyrics(
  track: string,
  artist: string
): Promise<MusixmatchLyricsResult> {
  const apiKey = process.env.MUSIXMATCH_API_KEY;
  if (!apiKey) {
    console.warn("MUSIXMATCH_API_KEY not set, skipping Musixmatch fallback");
    return { plain: null };
  }

  try {
    const url = new URL(`${MUSIXMATCH_BASE}/matcher.lyrics.get`);
    url.searchParams.set("q_track", track);
    url.searchParams.set("q_artist", artist);
    url.searchParams.set("apikey", apiKey);

    const res = await fetch(url.toString());
    if (!res.ok) return { plain: null };

    const data = await res.json();
    const status = data?.message?.header?.status_code;
    if (status !== 200) return { plain: null };

    const lyricsBody: string | undefined =
      data?.message?.body?.lyrics?.lyrics_body;

    if (!lyricsBody) return { plain: null };

    // Musixmatch free tier appends a "commercial use" disclaimer line —
    // strip it so it doesn't show up in the UI
    const cleaned = lyricsBody
      .replace(/\*+\s*This Lyrics is NOT for Commercial use[\s\S]*$/i, "")
      .trim();

    return { plain: cleaned || null };
  } catch (error) {
    console.error("Musixmatch fetch error:", error);
    return { plain: null };
  }
}
