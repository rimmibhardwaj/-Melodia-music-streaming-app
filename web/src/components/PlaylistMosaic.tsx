import React, { useMemo, useState } from 'react';
import { Song } from '@/types';
import { EmptyPlaylistIcon } from './Sidebar';

interface PlaylistMosaicProps {
  tracks: Song[];
  name?: string;
}

export const PlaylistMosaic = React.memo(function PlaylistMosaic({ tracks, name }: PlaylistMosaicProps) {

  // Extract up to 4 thumbnail URLs to form the 2x2 grid
  const quadrants = useMemo(() => {
    if (!tracks || tracks.length === 0) return [];

    const urls = tracks.map(t => t.thumbnailUrl).filter(Boolean);
    if (urls.length === 0) return [];

    if (urls.length >= 4) {
      return urls.slice(0, 4);
    }
    
    // 1-3 tracks: repeat them to fill 4 slots
    const filled = [];
    for (let i = 0; i < 4; i++) {
      filled.push(urls[i % urls.length]);
    }
    return filled;
  }, [tracks]);

  // If no tracks or no valid URLs, show fallback
  if (quadrants.length === 0) {
    return <EmptyPlaylistIcon name={name || 'Playlist'} />;
  }

  return (
    <div className="relative w-8 h-8 rounded-md overflow-hidden shrink-0 bg-[#201633]">
      {/* Mosaic Grid */}
      <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-[1px]">
        {quadrants.map((url, i) => (
          <img
            key={`${url}-${i}`}
            src={url}
            alt=""
            className="w-full h-full object-cover"
          />
        ))}
      </div>
    </div>
  );
});
