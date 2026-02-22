import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    // 1. Extract the search query from the URL params
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
    }

    const API_KEY = process.env.YOUTUBE_API_KEY;
    if (!API_KEY) {
      console.error("YOUTUBE_API_KEY is missing in environment variables");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // 2. Fetch data from YouTube Data API v3
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          part: "snippet",
          q: `${query} recipe tutorial`, // We add "recipe tutorial" to focus results
          maxResults: 3,
          type: "video",
          videoEmbeddable: "true",
          key: API_KEY,
        },
      }
    );

    // 3. Format and return the video data
    const videos = response.data.items.map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
    }));

    return NextResponse.json({ success: true, videos });
  } catch (error: any) {
    console.error("YouTube API Error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Failed to fetch YouTube recommendations" },
      { status: 500 }
    );
  }
}