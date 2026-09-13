# Atlas — Deployment Guide

Atlas is now a fully static site. There's no server, no database — the atlas
data lives inside the frontend build and everything runs in the browser.

## Publishing to Netlify (the easy way)

Once, to set up:

1. **Build the site locally**
   ```bash
   cd frontend
   yarn install
   yarn build
   ```
   That creates a `frontend/build/` folder. Everything you need to publish is
   inside it.

2. **Sign up for [Netlify](https://app.netlify.com/) (free).**

3. On the Netlify dashboard, choose **Sites → Add new site → Deploy manually**
   and drag the `frontend/build/` folder onto the drop zone.

4. Netlify gives you a URL like `something-random-123.netlify.app`. That's
   your live atlas. You can rename it or point a custom domain at it later
   in the site's settings.

## Updating the atlas after you've published

Whenever you change emotion names, descriptions, or colours:

1. Open the local dev server:
   ```bash
   cd frontend
   yarn start
   ```
2. In the browser, go to <http://localhost:3000/admin>.
3. Edit any cells you like.
4. Click **Download emotions.json**.
5. Move the downloaded file into `frontend/src/data/emotions.json`
   (overwriting the existing one).
6. Rebuild: `yarn build`.
7. Drag the new `frontend/build/` folder onto the same Netlify site to update
   the live version.

That's it. No server, no keys, no bills.

## Git-based deploys (optional, more advanced)

If you connect this repo to Netlify via GitHub, Netlify will read the
`netlify.toml` at the project root and build the site automatically on every
push. In that flow, editing the atlas becomes: edit `emotions.json`, commit,
push — Netlify redeploys.

## Notes

- **The `/admin` route is client-only.** Anyone who visits it in a browser can
  edit and download a JSON, but their download never affects the live site —
  only files you commit to the project and rebuild are published.
- **Any coordinate you haven't named** stays a colour patch with no label, and
  clicking it shows a soft "Unnamed" placeholder in the HUD.
- **The `backend/` folder is no longer required for the deployed site** — it
  was used for the earlier server-backed version and can be ignored (or
  deleted) when publishing statically.
