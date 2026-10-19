// Vercel serverless function: GET /api/now-playing
// Needs three environment variables set in Vercel (Project → Settings → Environment Variables):
//   SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN

import { getAccessToken } from "./_spotify.js";

const NOW_URL = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENT_URL = "https://api.spotify.com/v1/me/player/recently-played?limit=1";

function shape(track, isPlaying) {
  return {
    isPlaying,
    title: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    album: track.album.name,
    albumImageUrl: track.album.images?.[0]?.url ?? null,
    songUrl: track.external_urls?.spotify ?? null,
  };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");

  if (!process.env.SPOTIFY_REFRESH_TOKEN) {
    return res.status(200).json({ configured: false });
  }

  try {
    const token = await getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };

    const now = await fetch(NOW_URL, { headers });
    if (now.status === 200) {
      const data = await now.json();
      if (data?.item && data.currently_playing_type === "track") {
        return res.status(200).json(shape(data.item, data.is_playing));
      }
    }

    const recent = await fetch(RECENT_URL, { headers });
    if (recent.ok) {
      const data = await recent.json();
      const track = data.items?.[0]?.track;
      if (track) return res.status(200).json(shape(track, false));
    }

    return res.status(200).json({ isPlaying: false });
  } catch (err) {
    return res.status(500).json({ error: "spotify_unavailable" });
  }
}
