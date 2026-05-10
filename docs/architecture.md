# Architecture

## Overview

theTube is a personal blog — technical posts and travel writing. No ads, no analytics.

**Goal: a permissioned, dynamic-feeling site built entirely from static content with no server.**

Permissions are enforced at the CDN layer (CloudFront signed cookies) and through role-based JSON index files fetched client-side at runtime. `PostList` is already a client component — it fetches whichever index files the visitor can reach and builds the post list from what comes back. The build is static; the browser provides the dynamism.

## Stack

| Concern         | Decision                              | Rationale                                    |
| --------------- | ------------------------------------- | -------------------------------------------- |
| Framework       | Next.js 15, App Router, TypeScript    | Familiar from other projects                 |
| Content         | Markdown files in `content/posts/`    | Plain text, git-versioned, editor-friendly   |
| Markdown → HTML | `marked`                              | Single dep, runs at build time               |
| Styling         | Plain CSS (`app/globals.css`)         | No framework, loads fast, survives long gaps |
| Images          | S3 + CloudFront URLs in `<img>` tags  | No server-side optimization needed           |
| Storage         | None (static export)                  | No server, no DB needed                      |
| Output          | `next export` → static HTML/JS/CSS    | Served from S3 + CloudFront                  |
| Hosting         | S3 bucket + CloudFront distribution   | ~$0.50/mo, zero maintenance                  |
| Deploy          | GitHub Actions → build → upload to S3 | Zero-touch on push to `main`                 |

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

| URL             | Content                                   |
| --------------- | ----------------------------------------- |
| `/`             | Post index (all posts, filterable by tag) |
| `/posts/[slug]` | Individual post                           |

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

The static export is the floor, not the ceiling. `PostList` is already a client component — it can `fetch` from any endpoint at runtime without touching `output: 'export'` or the build pipeline.

**Client-side fetches that need no server change:**
- Role-based JSON index files from S3 (permissioned via CloudFront signed cookies)
- Bluesky/AT Protocol reply counts fetched at build time or client-side
- Any public read API (DynamoDB via API Gateway, a feed endpoint, etc.)

**If a write path or private server is needed:**
- Add an API Gateway + Lambda (or EC2 + systemd) alongside the static site
- `PostList` fetches from it at runtime — the static export stays intact
- Add SQLite (`node:sqlite`) or DynamoDB for storage

**If full server rendering is needed:**
- Drop `output: 'export'`, add Next.js API routes
- Move to EC2 + systemd (same pattern as DPS-Ops)

The content model and component structure don't need to change in any of these paths.
