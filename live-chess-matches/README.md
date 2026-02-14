# Live Chess Matches Setup

1. Open Firebase console and create (or use) a project.
2. Enable **Realtime Database**.
3. Copy your **Web app config** JSON from Project settings (or at minimum your Realtime Database URL).
4. Open `/live-chess-matches/` and paste the config JSON or URL into the setup box.
5. Click **Save Config** and refresh the page.
6. Open the Bit app (`/app/`) and start/detect games — they will appear on the live page.

## Data path

Matches are stored under:

- `liveChessMatches/{matchId}`

Each match contains:

- `id`
- `domain`
- `variant`
- `status`
- `detectedAt`
- `lastSeenAt`

## Quick URL-only setup example

You can also paste only your URL, for example:

- `https://bitbytelabs-56eb1-default-rtdb.firebaseio.com/`
