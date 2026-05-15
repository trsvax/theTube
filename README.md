# theTube

Personal blog — technical posts and travel writing.

## Stack

- **Next.js 15** — App Router, TypeScript, static export (`output: 'export'`)
- **Markdown** — posts with YAML frontmatter
- **Plain CSS** — no framework, no Tailwind
- **Hosting** — S3 + CloudFront at [thetube.today](https://thetube.today)

## Repo Structure

This is the renderer. Content lives in separate repos:

| Repo                     | Visibility | Contains                              |
| ------------------------ | ---------- | ------------------------------------- |
| `trsvax/theTube`         | Public     | App code, deploy pipeline             |
| `trsvax/theTube-content` | Public     | Public posts, about/links pages       |
| `trsvax/thetube-private` | Private    | Protected content, auth lambda, infra |

The deploy workflow checks out all three repos, merges content into the build tree, then runs `next build`. Private content never touches the public repo.

## Adding a Post

Create `content/posts/<slug>.md` in **theTube-content**:

```markdown
---
title: My Post Title
date: 2026-05-15
tags: [tech, travel]
summary: One-line teaser shown on the index.
---

Post body in markdown...
```

Push to `main` in theTube-content, then push to `main` in theTube to trigger a deploy.

## Deploy

Push to `main` in this repo → GitHub Actions:

1. Checks out theTube, theTube-content, and thetube-private
2. Merges content from both content repos into the build tree
3. `npm ci && npm run build` → generates `out/`
4. Synced to S3, CloudFront cache invalidated
5. CloudFront Function (`cf-short-urls.js`) deployed for short URL redirects
