import { Song } from "@/types";
import TrackDetailClient from "./TrackDetailClient";

export default async function TrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Fetch track from YouTube API
  const apiKey = process.env.YOUTUBE_API_KEY;
  const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${id}&key=${apiKey}`, {
    next: { revalidate: 3600 } // Cache for 1 hour
  });
  
  const data = await res.json();
  const track = data.items?.[0];

  if (!track) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full text-[#F8F5F0]">
        <h1 className="text-3xl font-bold mb-4">Track not found</h1>
        <p className="text-[#9D84C7]">The track you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  const song: Song = {
    id: track.id,
    title: track.snippet.title,
    channelTitle: track.snippet.channelTitle,
    thumbnailUrl: track.snippet.thumbnails?.high?.url || track.snippet.thumbnails?.medium?.url || track.snippet.thumbnails?.default?.url,
    duration: 0, // Simplified for now on track page
  };

  return <TrackDetailClient song={song} />;
}
