---
title: Building theTube
date: 2026-05-08
tags: [tech]
summary: How I built this blog — Next.js static export, plain CSS, markdown files, four npm deps, and a proper brand.
---

A simple personal blog that survives long gaps between posts. No server to maintain, no dependencies to rot, no CMS to log into.

## The stack

Four runtime dependencies:

- `next` — the framework
- `react` + `react-dom` — obvious
- `marked` — markdown to HTML at build time

Posts are plain markdown files with YAML frontmatter. The whole thing builds to static HTML and ships to S3 + CloudFront via GitHub Actions.

## What I didn't use

- No Tailwind — plain CSS in one file
- No MDX — if a post needs React components, it gets its own `page.tsx`
- No CMS — `git push` is the publish button
- No dark mode toggle — `prefers-color-scheme` in CSS handles it
- No `next/image` — plain `<img>` tags with S3/CloudFront URLs

## The brand

The site has a real brand, done by a graphic designer — not an afterthought. The palette:

- **Warm Midnight** `#2A0002` — the dark maroon for text and headings
- **Sunshine** `#F18636` — orange for accents and hover states
- **Open Sky** `#455978` — navy for links and nav
- **Enamel** `#F1E1D5` — the warm cream background

The typeface is **Swear Display** by Oh No Type Company — Black for headlines, Cilati italic for emphasis. Fonts are web-licensed, kept out of the git repo, synced to S3 and pulled into the build from there.

Logo files (SVG, dark/light mode variants) live in `public/` and are tracked by git. The font files are not — they're gitignored locally and downloaded from S3 in CI before the build runs.

## The build

GitHub Actions on every push to `main`:

1. `npm ci`
2. Pull fonts from S3 into `public/fonts/`
3. `npm run build` → static `out/`
4. `aws s3 sync out/ s3://bucket --delete`
5. CloudFront invalidation

Total build time: about 30 seconds.
