# Editing emotion text — what already exists, and what could change

## Two ways to edit today

Both are already built. Either works.

### 1. The admin editor at `/admin`
- Open the app locally in a browser, go to `/admin`.
- Every one of the 196 grid cells shows up as an editable card: name, description, custom colour, motion preset, and the four Visit fields (how it feels in the body, what brings it up, thoughts, urges).
- Edits stay in the browser tab until you click **Download emotions.json**.
- Drop the downloaded file into the project's data folder, then rebuild and republish for the changes to appear on the live site.
- No passphrase, no login — it's a purely local workflow. Anyone visiting `/admin` on the deployed site can also edit and download, but their download doesn't affect the live atlas because only files committed to the project and rebuilt get published.

### 2. Editing the data file directly
- Open `frontend/src/data/emotions.json` in any text editor.
- Each entry is keyed by coordinate (e.g. `"4,4"`) and holds `name`, `description`, and optional `color`, `motion`, `physical`, `events`, `thoughts`, `urges`.
- Save the file and rebuild.

Both paths write the same file in the same shape.

## When to use which

- **`/admin`** is more forgiving: it shows every cell, marks placeholders, previews colours, has a dropdown for the eight motion presets, and enforces the file shape when you save.
- **Direct JSON** is faster for a single one-line fix if you already know the coordinate and don't need to see the whole grid.

## Decisions

1. **Does the current setup work as-is, or is something missing?**
   Nothing new needs to be built to answer the question — this is a documentation reply. The two proposals below are only small polish, offered in case they're useful.

2. **Optional polish — a discreet "edit this" link.**
   When running locally, a small "Edit this feeling" link could appear in the Visit overlay (or HUD) that jumps straight to `/admin` scrolled to the emotion's cell. On the deployed site the link stays hidden. Small change.
   - Say **yes** to add it.
   - Say **no** or ignore and everything stays exactly as it is.

3. **Optional polish — a short one-page cheat sheet.**
   A single `EDITING.md` at the project root capturing the two workflows above plus a table of the eight motion presets and the four Visit fields. Useful for coming back to the project months from now.
   - Say **yes** to add it.
   - Say **no** or ignore to skip.

## Assumptions (change any if wrong)

- The question is about text/content editing, not about changing the underlying grid structure or adding new fields.
- No new field, new preset, or new UI is being requested at this point.
- The existing `/admin` editor still works and hasn't been broken since it was built.

## What is not changing

- The published static site keeps its download-a-file editing model — no server, no database, no accounts.
- No visitor-facing edit UI on the live site.
- All existing content, colours, motions, and layout stay untouched.
