# Harshitha Kuchibhotla: Personal Site

Plain HTML/CSS/JS with one serverless function for Spotify. There's no build step, no database and no framework.

```
index.html            the whole page
styles.css            theme + layout
script.js             nav, animations, "blasts", Spotify widget
api/now-playing.js    Vercel function that calls Spotify
photos/               put photo1.jpg … photo4.jpg here
resume.pdf            linked from the Download Resume buttons
scripts/get_spotify_token.py   one-time helper to get a Spotify refresh token
```

## Add your photos
Put four photos in `photos/` and name them `photo1.jpg`, `photo2.jpg`, `photo3.jpg` and `photo4.jpg`.
Portrait (4:5) works best. Until you add them, a striped placeholder shows in each spot.
To change a caption, edit the `<figcaption>` text in `index.html`.

## Deploy (GitHub + Vercel, all in the browser)
1. Create a new **public or private** repo on github.com, for example `harshitha-site`.
2. Click **Add file → Upload files** and drag in everything inside this folder.
   That includes the `api`, `photos` and `scripts` folders, but leave out `.env` files.
3. Go to vercel.com, sign in with GitHub, then click **Add New → Project** and import the repo.
   Leave every setting at its default and click **Deploy**.
4. Every time you change a file on GitHub, Vercel redeploys automatically.

## Connect Spotify
1. Go to developer.spotify.com/dashboard and click **Create app**.
   - Redirect URI: `http://127.0.0.1:8888/callback`
   - API: tick **Web API**
2. Open the app's **Settings** and copy the **Client ID** and **Client Secret**.
3. On your Mac, from this folder, run:
   ```bash
   python3 scripts/get_spotify_token.py
   ```
   Paste the ID and secret, click **Agree** in the browser, and copy the refresh token it prints.
4. In Vercel, go to **Project → Settings → Environment Variables** and add:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `SPOTIFY_REFRESH_TOKEN`
5. Go to **Deployments**, open the **⋯** menu on the latest one, and click **Redeploy**.

The card shows your current song with a spinning record. When nothing is playing, it shows the last song you played.
