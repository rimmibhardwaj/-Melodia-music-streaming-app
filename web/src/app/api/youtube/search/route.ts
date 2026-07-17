import { NextRequest, NextResponse } from "next/server";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Cache map: search query -> { items, timestamp }
const searchCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

function parseISO8601Duration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  
  return (hours * 3600) + (minutes * 60) + seconds;
}

export async function GET(request: NextRequest) {
  if (!YOUTUBE_API_KEY) {
    return NextResponse.json({ error: "Missing YOUTUBE_API_KEY" }, { status: 500 });
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("search") || searchParams.get("q") || "";
  
  if (!query) {
    return NextResponse.json([]);
  }

  const cacheKey = query.toLowerCase().trim();
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    // 1. Search for videos
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("q", query);
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("videoCategoryId", "10"); // Music category
    searchUrl.searchParams.set("maxResults", "15");
    searchUrl.searchParams.set("key", YOUTUBE_API_KEY);

    const searchRes = await fetch(searchUrl.toString());
    const searchData = await searchRes.json();

    if (!searchRes.ok) {
      const reason = searchData.error?.errors?.[0]?.reason || "";
      if (searchRes.status === 403 && (reason.includes("quotaExceeded") || reason.includes("dailyLimitExceeded"))) {
        return NextResponse.json({ errorType: "QUOTA_EXCEEDED", message: searchData.error?.message }, { status: 403 });
      }
      throw new Error(searchData.error?.message || "YouTube API search failed");
    }

    if (!searchData.items || searchData.items.length === 0) {
      return NextResponse.json([]);
    }

    // Extract video IDs
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(",");

    // 2. Fetch contentDetails for duration
    const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    videosUrl.searchParams.set("part", "contentDetails,snippet");
    videosUrl.searchParams.set("id", videoIds);
    videosUrl.searchParams.set("key", YOUTUBE_API_KEY);

    const videosRes = await fetch(videosUrl.toString());
    const videosData = await videosRes.json();

    if (!videosRes.ok) {
      const reason = videosData.error?.errors?.[0]?.reason || "";
      if (videosRes.status === 403 && (reason.includes("quotaExceeded") || reason.includes("dailyLimitExceeded"))) {
        return NextResponse.json({ errorType: "QUOTA_EXCEEDED", message: videosData.error?.message }, { status: 403 });
      }
      throw new Error(videosData.error?.message || "YouTube API videos failed");
    }

    // 3. Normalize into our Song type
    const songs = videosData.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      duration: parseISO8601Duration(item.contentDetails.duration)
    }));

    // Save to cache
    searchCache.set(cacheKey, { data: songs, timestamp: Date.now() });

    return NextResponse.json(songs);
  } catch (error: any) {
    console.error("YouTube API error:", error);
    return NextResponse.json({ errorType: "GENERIC", message: error.message }, { status: 500 });
  }
}
