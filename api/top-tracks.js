// Vercel serverless function: GET /api/top-tracks
// Your top 5 songs from roughly the last 4 weeks ("short_term").
// Spotify's default is "medium_term" (~6 months), which feels out of date.
// Requires the refresh token to include the user-top-read scope.

import { getAccessToken } from "./_spotify.js";

const TOP_URL = "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=5";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");

  if (!process.env.SPOTIFY_REFRESH_TOKEN) {
    return res.status(200).json({ configured: false, tracks: [] });
  }

  try {
    const token = await getAccessToken();
    const top = await fetch(TOP_URL, { headers: { Authorization: `Bearer ${token}` } });
    if (!top.ok) throw new Error(`top ${top.status}`);
    const data = await top.json();

    const tracks = (data.items ?? []).map((t) => ({
      title: t.name,
      artist: t.artists.map((a) => a.name).join(", "),
      albumImageUrl: t.album.images?.at(-1)?.url ?? null,
      songUrl: t.external_urls?.spotify ?? null,
    }));
    return res.status(200).json({ tracks });
  } catch (err) {
    return res.status(500).json({ error: "spotify_unavailable", tracks: [] });
  }
}
