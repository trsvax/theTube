# Architecture

## Overview

theTube is a personal blog — technical posts and travel writing. Public, no auth, no ads, no analytics.

## Stack

| Concern | Decision | Rationale |
|---|---|---|
| Framework | Next.js 15, App Router, TypeScript | Familiar from other projects |
| Content | Markdown files in `content/posts/` | Plain text, git-versioned, editor-friendly |
| Markdown → HTML | `marked` | Single dep, runs at build time |
| Styling | Plain CSS (`app/globals.css`) | No framework, loads fast, survives long gaps |
| Images | S3 + CloudFront URLs in `<img>` tags | No server-side optimization needed |
| Storage | None (static export) | No server, no DB needed |
| Output | `next export` → static HTML/JS/CSS | Served from S3 + CloudFront |
| Hosting | S3 bucket + CloudFront distribution | ~$0.50/mo, zero maintenance |
| Deploy | GitHub Actions → build → upload to S3 | Zero-touch on push to `main` |

## Content Model

Posts are `.md` files under `content/posts/` with YAML frontmatter:

```markdown
---
title: Building a Blog
date: 2026-05-08
tags: [tech]
summary: What I learned building this site.
---

Post body here...
```

**Fields:**
- `title` — display title
- `date` — ISO date string, used for sorting
- `tags` — array of strings: `tech`, `travel`, `tg` (extensible)
- `summary` — one-line teaser shown on index

## URL Structure

| URL | Content |
|---|---|
| `/` | Post index (all posts, filterable by tag) |
| `/posts/[slug]` | Individual post |

Slug = filename without `.md`.

## Tag Filtering

Client-side React state — all post metadata embedded in the index page at build time, filtered in the browser. No server round-trip.

## Build Pipeline

```
git push main
  → GitHub Actions: .github/workflows/deploy.yml
      - npm ci
      - npm run build        (next build → static out/)
      - aws s3 sync out/ s3://bucket-name --delete
      - aws cloudfront create-invalidation --paths "/*"
```

## No-server Constraints

`output: 'export'` means:
- No API routes
- No server components that read files at request time (build-time only)
- No `next/image` optimization — use plain `<img>` with S3/CloudFront URLs
- Tag filtering is client-side

## Adding Dynamic Features Later

If comments, view counts, or other dynamic features are needed:
- Switch to EC2 + systemd (same pattern as DPS-Ops)
- Add SQLite (`node:sqlite`) for storage
- Drop `output: 'export'`, add API routes

The content model and component structure don't need to change.
