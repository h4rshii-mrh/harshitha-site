"""
One-time helper to get your Spotify refresh token.

1. In your Spotify app's settings, add this Redirect URI exactly:
       http://127.0.0.1:8888/callback
2. Run (from the project folder):
       python3 scripts/get_spotify_token.py
3. Paste your Client ID and Client Secret when asked, open the link it prints,
   click "Agree", and copy the refresh token it shows you into Vercel.
"""
import base64
import http.server
import json
import secrets
import urllib.parse
import urllib.request
import webbrowser

REDIRECT_URI = "http://127.0.0.1:8888/callback"
SCOPES = "user-read-currently-playing user-read-recently-played user-top-read"

client_id = input("Spotify Client ID: ").strip()
client_secret = input("Spotify Client Secret: ").strip()
state = secrets.token_urlsafe(16)

auth_url = "https://accounts.spotify.com/authorize?" + urllib.parse.urlencode({
    "client_id": client_id,
    "response_type": "code",
    "redirect_uri": REDIRECT_URI,
    "scope": SCOPES,
    "state": state,
})


class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        if query.get("state", [""])[0] != state or "code" not in query:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b"Something went wrong. Check the terminal.")
            return

        basic = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
        req = urllib.request.Request(
            "https://accounts.spotify.com/api/token",
            data=urllib.parse.urlencode({
                "grant_type": "authorization_code",
                "code": query["code"][0],
                "redirect_uri": REDIRECT_URI,
            }).encode(),
            headers={"Authorization": f"Basic {basic}",
                     "Content-Type": "application/x-www-form-urlencoded"},
        )
        with urllib.request.urlopen(req) as resp:
            token = json.load(resp)["refresh_token"]

        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"Done! Go back to your terminal. xoxo")
        print("\nYour SPOTIFY_REFRESH_TOKEN is:\n\n" + token + "\n")
        print("Add it to Vercel along with your Client ID and Secret. Keep it private.")

    def log_message(self, *args):
        pass


print("\nOpening Spotify in your browser. If it doesn't open, visit:\n" + auth_url + "\n")
webbrowser.open(auth_url)
http.server.HTTPServer(("127.0.0.1", 8888), Handler).handle_request()
