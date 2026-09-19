# Atlas — Deployment Guide

Atlas is a fully static site. Everything runs in the browser — no server,
no database, no build-time API calls. All emotion data lives in one file:
`frontend/src/data/emotions.json`.

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

## Editing the atlas

Edit `frontend/src/data/emotions.json` directly in any text editor. The file
is a JSON object keyed by coordinate strings like `"4,4"`. Each entry looks
like this:

```json
"4,4": {
  "name": "Inspired",
  "description": "A quick current of aliveness — you want to make something before the feeling fades.",
  "motion": "radiate",
  "color": "#f5c542",
  "physical": "A soft rush across the chest, a slight lift under the sternum, hands wanting to move.",
  "events": "Hearing an idea click, seeing someone else's work…",
  "thoughts": "\"I could try that.\" \"There's a version of this I'd love to make.\"",
  "urges": "Reach for a pen, open a blank page, tell someone, begin before the feeling fades."
}
```

**Required fields:**
- `name` — shown as the emotion label on the atlas and in the Visit overlay.
- `description` — the short single-line description in the HUD.

**Optional fields:**
- `color` — hex string overriding the computed gradient colour for that cell.
- `motion` — one of `still`, `panic`, `heavy`, `pulse`, `breathe`, `radiate`, `flicker`, `sink`. Defaults to `still`. Drives the featured bubble animation in the Visit overlay.
- `physical`, `events`, `thoughts`, `urges` — the four expanded sections shown when someone opens the Visit view. Any that are omitted are simply hidden.

**Rules:**
- Coordinates go from -7 to +7 on both axes; **do not use x=0 or y=0** (they are skipped).
- Every coordinate you don't put in the JSON stays as a colour patch with no label and shows an "Unnamed" placeholder in the HUD when clicked.
- Names longer than ~12 characters will auto-shrink; names longer than that get an ellipsis on the atlas but the full name shows in the HUD/Visit panels.

## After editing

1. Rebuild: `cd frontend && yarn build`.
2. Drag the new `frontend/build/` folder onto the same Netlify site to
   update the live version.

That's it. No server, no keys, no bills.

## Git-based deploys (optional)

If you connect this repo to Netlify via GitHub, Netlify will read the
`netlify.toml` at the project root and rebuild the site automatically on
every push. In that flow, editing the atlas becomes: edit `emotions.json`,
commit, push — Netlify redeploys.

## Notes

- **The `backend/` folder is no longer required for the deployed site** — it
  was used for an earlier server-backed version and can be ignored (or
  deleted) when publishing statically.
- **No admin UI is included in the built site.** Editing is text-file only,
  which keeps the site fast, secure, and free to host.
