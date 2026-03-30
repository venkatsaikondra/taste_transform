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
    const items = Array.isArray(response.data.items) ? response.data.items : [];
    const videos = items.map((item: unknown) => {
      const record = typeof item === 'object' && item !== null ? item as Record<string, unknown> : {};
      const id = typeof record.id === 'object' && record.id !== null ? record.id as Record<string, unknown> : {};
      const snippet = typeof record.snippet === 'object' && record.snippet !== null ? record.snippet as Record<string, unknown> : {};
      const thumbnails = typeof snippet.thumbnails === 'object' && snippet.thumbnails !== null ? snippet.thumbnails as Record<string, unknown> : {};
      const high = typeof thumbnails.high === 'object' && thumbnails.high !== null ? thumbnails.high as Record<string, unknown> : {};

      return {
        videoId: typeof id.videoId === 'string' ? id.videoId : '',
        title: typeof snippet.title === 'string' ? snippet.title : '',
        thumbnail: typeof high.url === 'string' ? high.url : '',
        channelTitle: typeof snippet.channelTitle === 'string' ? snippet.channelTitle : '',
      };
    });

    return NextResponse.json({ success: true, videos });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("YouTube API Error:", message);
    return NextResponse.json(
      { error: "Failed to fetch YouTube recommendations" },
      { status: 500 }
    );
  }
}