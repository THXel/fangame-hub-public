# THXel Hub Showcase (GitHub Pages)

This repository is **only** the public, read-only showcase for your Hub (Library + Stats).

## What to upload here
Only the static site in `/docs`:
- `docs/index.html`
- `docs/assets/*`
- `docs/data.json`

## Enable GitHub Pages
GitHub repo → **Settings → Pages**
- Source: `main`
- Folder: `/docs`

Your public URL will look like:
`https://<YOURNAME>.github.io/<REPO>/`

## How to connect your Hub
Your Hub should regularly overwrite this repo’s `/docs` folder with a freshly generated export and push.

Minimal idea:
1. Hub generates `docs/` (HTML + assets + data)
2. Copy that `docs/` into this repo (replacing the old one)
3. `git add docs && git commit -m "Update showcase" && git push`

> Important: never publish any local paths like `/home/...` or executable locations.
