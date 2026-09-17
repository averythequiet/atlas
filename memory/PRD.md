# The Feeling Field — PRD

## Original Problem Statement
An interactive emotions chart where you can explore the meanings and experiences of different emotions, arranged on an x/y axis continuum. -x unpleasant, +x pleasant, -y low energy, +y high energy. Reduced to -8..+7 (256 total). Bubble-like circles with subtle moving aura. Hover enlarges 50% and pushes neighbors aside like bubbles.

## User Choices
- Emotion data source: Hybrid (curated + AI-generated on click via Claude Sonnet 4.6)
- Detail view: Emotion name + brief description only
- Theme: Both Soft Ethereal Light AND Dark Dreamy Cosmic (toggle)
- Purely exploratory (no journaling / no auth)
- Grid: 16x16 = 256 emotions, integer coords -8 to +7 on both axes

## User Personas
- Curious explorer / journaler wanting a fresh way to name feelings
- Therapist / educator introducing affect models

## Architecture (Feb 2026 — static)
- **Frontend** (React 19): the entire app. d3-force physics grid, framer-motion HUD, theme toggle, client-side admin editor.
- **Data**: `frontend/src/data/emotions.json` — bundled at build time. Source of truth for all emotion names, descriptions, and per-cell colour overrides.
- **Backend / MongoDB / LLM**: no longer required for the deployed site. The `backend/` folder from the earlier server-backed version is kept in the repo but is not part of the static deploy.

## Deploy target: Netlify (static)
- `netlify.toml` at repo root; `frontend/public/_redirects` provides SPA fallback so `/admin` resolves to `index.html`.
- Publish flow: `yarn build` inside `frontend/`, then drag `frontend/build/` onto Netlify.
- Editor flow: run locally, edit cells, click **Download emotions.json**, drop the file into `frontend/src/data/`, rebuild, redeploy.

## Emotion data schema (frontend/src/data/emotions.json)
Each entry is keyed `"x,y"` and holds:
- `name` (string, required)
- `description` (string, required — the short line shown in the HUD)
- `color` (optional hex like `#a1b2c3`, admin override)
- `physical`, `events`, `thoughts`, `urges` (optional strings) — the four expanded sections shown in the Visit overlay. If none are filled, the overlay shows a soft "More detail is still being written" line.

## Visit overlay
- Users click **Visit this emotion** in the HUD to open a pokedex-style modal.
- Card shows a scaled featured bubble (same colour + aura), the coordinate, name, description, and up to four scrollable sections.
- Dismisses on X, backdrop click, or Escape. Body scroll is locked while open.
- Only offered for coordinates with a real name (not TODO placeholders).

## Visit motion presets
The featured bubble in the Visit overlay can be given a `motion` preset that
animates its core, aura, and 8 orbiting particles. All animations are pure
CSS keyframes (no per-frame JS). Presets available in the admin editor:
- `still` — gentle default
- `panic` — prickly jitter + rapid particle spikes
- `heavy` — slow bob + particles drifting downward
- `pulse` — rhythmic upbeat scale + particles pinging outward
- `breathe` — long inhale/exhale with orbs expanding on the breath
- `radiate` — steady core with particles rising upward like inspiration
- `flicker` — unstable candle-like opacity + micro-jitter
- `sink` — slow downward drift with trailing particles

Respects `prefers-reduced-motion`. Preset stored in `emotions.json` as the
optional `motion` field; omitted when set to `still`.

## Implemented (v1, Feb 2026)
- 196 bubble grid (4 quadrants, 7x7 each, skipping x=0 and y=0) with d3-force collision physics
- Click-to-expand marble physics (synchronized d3-force + CSS scaling via useLayoutEffect)
- Bubble breathe + aura pulse CSS animations (organic drift)
- Ethereal (light pearlescent) and Cosmic (dark starfield) themes with smooth transition
- Custom pan/zoom canvas wrapping the grid
- Persistent HUD (EmotionDetailPanel) showing selected emotion
- `/admin` editor with passphrase auth gate (`fH4KGbiw!`) for inline editing of titles, descriptions, and per-cell custom colors
- Backend: `GET /api/emotions`, `PUT /api/emotions/{x}/{y}` (admin), `POST /api/admin/verify`
- Nearby Suggestions: selecting a bubble softly glows its 8 immediate neighbours (axis-aware — jumps across the skipped x=0 / y=0 axis so cross-quadrant neighbours light up too) and gently dims the rest of the atlas
- Click outside the grid clears the current selection and restores the atlas
- Bubble labels: emotion name shown inside each labelled bubble; visible only when zoomed to ≥ 80% (PanZoom toggles `.zoom-labels-visible`); TODO placeholders remain unlabeled
- Aged-paper vibe in light mode (soft sepia vignette + slight grain bump); dark-mode starfield untouched
- Compressed axis gap (`AXIS_GAP_STEPS = 1.35`) so the four quadrants sit closer together as a single continuous field

## Color Scheme (Feb 2026, iterated with user)
- Q1 (pleasant / high energy): vibrant yellow field — soft muted yellow near origin, bright saturated yellow far right, deep golden yellow top corner (no red undertones)
- Q2 (unpleasant / high energy): red-orange near y-axis → pure red top; pink-magenta at (-7,+1) grading up to a deep ruby jewel at (-7,+7)
- Q3 (unpleasant / low energy): medium cyan-blue near origin row grading to deep sapphire jewel tones on the -7 row, floor capped at hsl(246, 75%, 34%) (no amethyst purple)
- Q4 (pleasant / low energy): deep teal → pure green on -1 row, deep teal → emerald jewel tones on -7 row

## Backlog (P1/P2)
- P1: Expand curated set to all 256 coordinates
- P1: Search box to jump to an emotion by name
- P2: Share-a-feeling link (encode current selection in URL)
- P2: Journaling / "I felt this today" logbook
- P2: Emotion connections / suggested nearby emotions
- P2: Ambient soundscape tied to quadrant
