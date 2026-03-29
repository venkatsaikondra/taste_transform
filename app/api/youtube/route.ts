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
          q: `${query} recipe tutorial`,
          maxResults: 3,
          type: "video",
          videoEmbeddable: "true",
          key: API_KEY,
        },
      }
    );

    type YouTubeSearchItem = {
      id: { videoId: string };
      snippet: {
        title: string;
        thumbnails: { high: { url: string } };
        channelTitle: string;
      };
    };

    const videos = (response.data.items as YouTubeSearchItem[]).map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
    }));

    return NextResponse.json({ success: true, videos });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'YouTube request failed';
    console.error("YouTube API Error:", message);
    return NextResponse.json(
      { error: "Failed to fetch YouTube recommendations" },
      { status: 500 }
    );
  }
}