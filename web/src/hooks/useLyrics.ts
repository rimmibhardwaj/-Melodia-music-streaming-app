import { useState, useEffect, useMemo } from "react";
import type { LyricLine, LyricsResponse } from "@/app/api/lyrics/route";

export function useLyrics(
  trackName: string | null,
  artistName: string | null,
  duration: number | null,
  videoId?: string | null
) {
  const [lyrics, setLyrics] = useState<LyricsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trackName || !artistName) {
      setLyrics(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      track: trackName,
      artist: artistName,
    });
    if (duration) params.set("duration", String(Math.round(duration)));
    if (videoId) params.set("videoId", videoId);

    fetch(`/api/lyrics?${params.toString()}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data: LyricsResponse) => setLyrics(data))
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error(err);
          setError("Failed to load lyrics");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [trackName, artistName, duration, videoId]);

  return { lyrics, loading, error, setLyrics };
}

// Given synced lines and current playback time, find the active line index
export function useActiveLyricIndex(
  lines: LyricLine[] | null,
  currentTime: number
) {
  return useMemo(() => {
    if (!lines || lines.length === 0) return -1;

    let activeIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].time <= currentTime) {
        activeIndex = i;
      } else {
        break;
      }
    }
    return activeIndex;
  }, [lines, currentTime]);
}
