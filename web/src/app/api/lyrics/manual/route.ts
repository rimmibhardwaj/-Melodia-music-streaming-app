import { NextRequest, NextResponse } from "next/server";
import { saveManualLyrics } from "@/lib/manualLyricsStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { videoId, lyrics } = body;

    if (!videoId || !lyrics || typeof lyrics !== "string") {
      return NextResponse.json(
        { error: "videoId and lyrics are required" },
        { status: 400 }
      );
    }

    // Save the lyrics locally
    await saveManualLyrics(videoId, lyrics.trim());

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving manual lyrics:", error);
    return NextResponse.json(
      { error: "Failed to save lyrics" },
      { status: 500 }
    );
  }
}
