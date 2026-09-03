# Freestyle X O — Netlify deploy package

This folder is ready to deploy as-is. Online multiplayer is powered by a
Netlify Function (`netlify/functions/room.js`) backed by **Netlify Blobs**
— Netlify's built-in key/value store. You don't need Firebase, Supabase, or
any other third-party service or API key; it works automatically once the
site is deployed on Netlify.

## Deploy (drag-and-drop — easiest)

1. Go to https://app.netlify.com/drop
2. Drag this whole folder onto the page (keep the folder structure intact —
   `index.html`, `netlify.toml`, `package.json`, and the `netlify/functions/`
   folder must all be included, not just index.html).
3. Netlify builds it and gives you a live URL (e.g. `your-game.netlify.app`).

## Deploy (Git — recommended if you'll keep updating it)

1. Push this folder to a GitHub/GitLab/Bitbucket repo.
2. In Netlify: **Add new site → Import an existing project** → pick the repo.
3. Build settings: leave the build command empty, publish directory `.`
   (netlify.toml already sets this, so the defaults should just work).
4. Deploy. Every future `git push` auto-deploys.

## Deploy (Netlify CLI)

```bash
npm install -g netlify-cli
cd this-folder
netlify deploy --prod
```

## How online mode works

- `index.html` is the whole game (single file, canvas-based).
- When two people play Online, the host's browser calls
  `POST /api/room?code=XXXXX` to save the match state, and both browsers
  poll `GET /api/room?code=XXXXX` every ~1.5s to pick up each other's moves.
- `netlify.toml` routes `/api/room` to the function at
  `netlify/functions/room.js`, which reads/writes that state to Netlify
  Blobs under the room code as the key.
- Room codes are 5 characters, so collisions are practically never an
  issue. Rooms aren't explicitly deleted — they're just abandoned and
  overwritten if the code is reused — which is fine for a casual game
  like this.

## Costs / limits

Netlify's free tier includes:
- 125,000 function invocations/month
- Netlify Blobs storage well beyond what tiny JSON room states need

A room polling every 1.5s uses ~40 requests/minute per active match, so the
free tier comfortably supports plenty of casual concurrent games. If it
ever gets heavy traffic, you'd want to bump the poll interval
(`ONLINE_POLL_MS` near the top of the `<script>` in index.html) or move to
a paid plan — but for friends playing together, the defaults are fine.

## Local testing

```bash
npm install -g netlify-cli
npm install
netlify dev
```

This runs the site with functions locally (Netlify Blobs works fine in
`netlify dev` too), so you can test Online mode with two browser tabs
before deploying.
