# Live Chess Matches Setup

1. Open Firebase console and create (or use) a project.
2. Enable **Realtime Database**.
3. Copy your **Web app config** JSON from Project settings (or at minimum your Realtime Database URL).
4. Open `/live-chess-matches/`.
5. In the **Setup Firebase** box, paste your config JSON or URL.
6. Click **Save Config**.
7. Refresh both `/live-chess-matches/` and `/app/`.
8. Keep the Bit app (`/app/`) open and start/detect games — they will appear on the live page.

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

You can paste only your URL, for example:

- `https://bitbytelabs-56eb1-default-rtdb.firebaseio.com/`
