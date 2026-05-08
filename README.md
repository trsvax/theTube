# theTube

Personal blog — technical posts and travel writing.

## Stack

- **Next.js 15** — App Router, TypeScript, static export
- **Markdown** — posts in `content/posts/` with YAML frontmatter
- **Plain CSS** — no framework
- **Hosting** — S3 + CloudFront

## Adding a Post

Create `content/posts/<slug>.md`:

```markdown
---
title: My Post Title
date: 2026-05-08
tags: [tech, travel]
summary: One-line teaser shown on the index.
---

Post body in markdown...
```

Push to `main` — GitHub Actions builds and deploys automatically.

## Local Development

```bash
npm ci
npm run dev
```

## Deploy

Push to `main`:

1. `npm ci`
2. `npm run build` → generates `out/`
3. Synced to S3, CloudFront cache invalidated

Required GitHub Actions secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`.
