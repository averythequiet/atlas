# Making Atlas a Website You Can Publish Yourself

## What you're asking for

You want to publish Atlas as a website but you don't want to deal with running a server or a database. You want a site made of files that you can drop onto a free host — the same kind of thing a plain HTML/CSS/JS site would be.

That is possible. Here's what it means for the app, and where you have decisions to make.

## What stays the same

- The atlas, the four quadrants, the 196 bubbles, the physics, the pan and zoom, the neighbour highlight, the labels, the light/dark toggle, the aged-paper vibe — all of that lives in the browser already. It works with no server.
- The credit line in the header. Your emotion names and descriptions. Your colours.
- The admin editor, in a modified form (see below).

## What has to change

Two features currently need the server and the database. To go server-less each has a choice attached.

### 1. Filling in unnamed cells with AI

Right now, when someone clicks a cell that hasn't been named yet, the server calls Claude and writes a name + description on the fly. That call cannot happen safely from the browser alone — it needs a key that has to stay hidden.

Options:

- **a. Drop the AI-fill feature.** Any cell you haven't personally named stays a colour patch with no label. Simplest option, no ongoing cost, no keys to worry about.
- **b. Fill in every remaining cell yourself, one time, in the editor.** Same end state as (a), but every bubble has a real name. This is the option that treats Atlas as a finished, curated map.
- **c. Keep AI-fill via a small serverless helper.** You'd still be able to publish to a free host, but you'd need to sign up for something like Netlify or Vercel and add one small "function" that holds the key for you. More setup, keeps the on-demand generation working for visitors.

**Assumed choice unless you say otherwise: (b).** Atlas has been converging on a fully curated map anyway.

### 2. The admin editor

Right now the editor talks to the server, which writes changes to the database.

Without a server, the editor changes shape:

- You open the editor page in your browser (locally on your computer, not on the published site).
- You edit names, descriptions, custom colours the same way you do now.
- When you're done, you click **Download** and it saves an updated data file.
- You replace the old data file inside your project folder with the new one and re-publish the site.

The published site itself will not have the editor route — it's only for you to run locally when you want to change the map. That means visitors can't edit the atlas (which is what you want anyway).

The passphrase gate goes away — since editing only affects a file on your own computer, there's nothing to protect.

## What "publishing" will actually look like

Once the change is done, your project produces a single folder of files. To put Atlas on the internet you'd do something like this — no coding needed at either step:

1. Sign up (free) for a static hosting service. Netlify is the easiest for people new to this — you literally drag the folder onto their website and it gives you back a live URL.
2. Whenever you edit the atlas, drag the new folder onto the same spot to update the live site.

You'll be able to pick your own web address later (free-tier options include something like `yourname.netlify.app`, or you can point a custom domain at it).

**Assumed target host: Netlify.** If you already prefer GitHub Pages, Vercel, or Cloudflare Pages, they all work the same way — just say which and it will be tuned for that one.

## What you're giving up

- No live AI generation for visitors clicking unnamed bubbles (unless you pick option 1c).
- No shared editing — only you edit the atlas, and only from your own computer.
- No visitor accounts, comments, saves, or anything that would need a server. Atlas stays purely exploratory.

If any of those three become important later, they can be added back with a small serverless helper — but that's a separate decision, not part of this change.

## Decisions to confirm

1. **Unnamed cells**: (a) leave unlabeled / **(b) fill in every one yourself before publishing** / (c) keep AI-fill with a serverless helper.
2. **Editor**: keep the download-a-file editor for your own use / drop the editor entirely and edit the data file in a text editor.
3. **Host**: **Netlify** / GitHub Pages / Vercel / Cloudflare Pages / other.

Assumed answers are in bold. Say the word and any of them can flip.
