"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Mic } from "lucide-react";
import { useLyrics, useActiveLyricIndex } from "@/hooks/useLyrics";

interface LyricsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  trackName: string | null;
  artistName: string | null;
  duration: number | null; // total song duration in seconds
  currentTime: number; // current playback position in seconds
  videoId: string | null;
  thumbnailUrl?: string | null;
}

export const LyricsPanel = React.memo(function LyricsPanel({
  isOpen,
  onClose,
  trackName,
  artistName,
  duration,
  currentTime,
  videoId,
  thumbnailUrl,
}: LyricsPanelProps) {
  const { lyrics, loading, error, setLyrics } = useLyrics(trackName, artistName, duration, videoId);
  
  const computedLyrics = React.useMemo(() => {
    if (lyrics?.synced && lyrics.synced.length > 0) return lyrics.synced;
    if (lyrics?.plain && duration) {
      const lines = lyrics.plain.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length === 0) return null;
      const timePerLine = duration / lines.length;
      return lines.map((text, i) => ({
        time: i * timePerLine,
        text
      }));
    }
    return null;
  }, [lyrics, duration]);

  const activeIndex = useActiveLyricIndex(computedLyrics, currentTime);
  const activeLineRef = useRef<HTMLParagraphElement>(null);

  const [lastManualScroll, setLastManualScroll] = useState(0);
  const handleManualInteraction = () => setLastManualScroll(Date.now());

  // Auto-scroll to keep the active line in view
  useEffect(() => {
    const timeSinceManual = Date.now() - lastManualScroll;
    if (timeSinceManual < 3000) {
      const timer = setTimeout(() => {
        activeLineRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 3000 - timeSinceManual);
      return () => clearTimeout(timer);
    } else {
      activeLineRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeIndex, lastManualScroll]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="flex h-full w-full flex-col glass-panel relative z-10">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-white/10 px-5 py-5 bg-black/10">
        <div className="flex items-center gap-3 overflow-hidden">
          {thumbnailUrl ? (
            <img 
              src={thumbnailUrl} 
              alt={trackName || "Song"} 
              className="w-14 h-14 rounded-md object-cover shadow-md flex-shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0">
              <Mic className="h-6 w-6 text-white/40" />
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-0.5">Lyrics</span>
            <h2 className="text-sm font-bold text-white truncate max-w-[200px]">{trackName || "Unknown Song"}</h2>
            <p className="text-xs text-white/60 truncate max-w-[200px]">{artistName || "Unknown Artist"}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close lyrics panel"
          className="text-white/50 hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div 
        className="flex-1 overflow-y-auto px-5 py-6 custom-scrollbar"
        onWheel={handleManualInteraction}
        onTouchMove={handleManualInteraction}
      >
        {loading && (
          <p className="text-center text-sm text-white/50 mt-10">Loading lyrics...</p>
        )}

        {!loading && (error || !lyrics) && (
          <div className="flex flex-col items-center gap-2 pt-16 text-center">
            <Mic className="h-8 w-8 text-white/20" />
            <p className="text-sm text-white/60">Lyrics not available for this track.</p>
            <p className="text-xs text-white/30">Try another song or check back later.</p>
          </div>
        )}

        {!loading && computedLyrics && (
          <div className="flex flex-col gap-6 py-[40vh]">
            {computedLyrics.map((line, i) => (
              <p
                key={`${line.time}-${i}`}
                ref={i === activeIndex ? activeLineRef : null}
                className={`text-lg transition-all duration-300 ease-in-out font-bold ${
                  i === activeIndex
                    ? "text-white opacity-100 scale-[1.02] origin-left"
                    : "text-white opacity-60 hover:opacity-80"
                }`}
              >
                {line.text || "♪"}
              </p>
            ))}
          </div>
        )}

        {!loading &&
          lyrics &&
          !computedLyrics && (
            <div className="flex flex-col items-center gap-2 pt-16 text-center">
              <Mic className="h-8 w-8 text-white/20" />
              <p className="text-sm text-white/60">Lyrics not available for this track.</p>
              <p className="text-xs text-white/30">Try another song or check back later.</p>
              
              {videoId && (
                <div className="w-full mt-4 text-left">
                  <ManualLyricsForm 
                    videoId={videoId} 
                    onSaved={(newLyrics) => setLyrics({ synced: null, plain: newLyrics, source: "manual" })} 
                  />
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
});

function ManualLyricsForm({
  videoId,
  onSaved,
}: {
  videoId: string;
  onSaved: (lyrics: string) => void;
}) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/lyrics/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, lyrics: text }),
      });
      if (res.ok) onSaved(text);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6 flex flex-col gap-2">
      <p className="text-xs text-white/50">
        Know the lyrics? Add them so they're saved for next time.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste lyrics here..."
        rows={6}
        className="rounded-md bg-white/10 p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
      />
      <button
        onClick={handleSave}
        disabled={saving || !text.trim()}
        className="self-start rounded-full bg-pink-500 px-4 py-1.5 text-xs font-medium text-white disabled:opacity-40"
      >
        {saving ? "Saving..." : "Save lyrics"}
      </button>
    </div>
  );
}
