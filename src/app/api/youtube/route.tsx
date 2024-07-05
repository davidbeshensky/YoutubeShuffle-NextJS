import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

interface PlaylistItem {
    id: string;
    snippet: {
        title: string;
        resourceId: {
            videoId: string;
        };
    };
  }

  const extractPlaylistId = (url: string): string | null => {
    const match = url.match(/list=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  async function fetchPlaylistItems(accessToken: string, apiKey: string | undefined, playlistId: string | null, pageToken = '') {
    let items: any[] = [];
    let nextPageToken = pageToken;

    do {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&pageToken=${nextPageToken}&key=${apiKey}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();
        items = items.concat(data.items.map((item: PlaylistItem) => ({
            title: item.snippet.title,
            videoId: item.snippet.resourceId.videoId
        })));

        nextPageToken = data.nextPageToken || '';
    } while (nextPageToken);

    return items;
}

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ message: "User not found" });
    }

    const playlistUrl = 'https://www.youtube.com/playlist?list=PLLhUn-idcYtxgo-3efTosjgcteKGKSrBP'
    const playlistId = extractPlaylistId(playlistUrl);


    //get oauth access token for user
    const provider = "oauth_google";
    const clerkResponse = await clerkClient().users.getUserOauthAccessToken(
      userId,
      provider
    );

    const accessToken = clerkResponse.data[0].token;
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

    const playlistItems = await fetchPlaylistItems(accessToken, apiKey, playlistId);

    return NextResponse.json({ playlistItems });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "internal Server Error" }), {
      headers: {
        "Content-Type": "application/json",
      },
      status: 500,
    });
  }
}
