---
title: Building theTube
date: 2026-05-08
tags: [tech]
summary: How I built this blog — Next.js static export, plain CSS, markdown files, and four npm deps.
---

This is the first post. It's about building the blog itself.

## The goal

A simple personal blog that survives long gaps between posts — no server to maintain,
no dependencies to rot, no CMS to log into.

## The stack

Four runtime dependencies:

- `next` — the framework
- `react` + `react-dom` — obvious
- `marked` — markdown to HTML at build time

Posts are plain markdown files with YAML frontmatter. The whole thing builds to static HTML
and ships to S3 + CloudFront via GitHub Actions.

## What I didn't use

- No Tailwind — plain CSS in one file
- No MDX — if a post needs React components, it gets its own `page.tsx`
- No CMS — `git push` is the publish button
- No dark mode toggle — `prefers-color-scheme` in CSS handles it
- No RSS — not yet

## The build

GitHub Actions builds on every push to `main`:

1. `npm ci`
2. `npm run build` → static `out/`
3. `aws s3 sync out/ s3://bucket --delete`
4. CloudFront invalidation

Total build time: about 30 seconds.
