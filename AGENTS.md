# AGENTS.md

Guidance for automated agents working in this repository.

## Don't make assumptions. If you don't know something, say so.

---

## Project Overview

theTube is a personal blog — technical posts and travel writing. Public, no auth.

- **Content** — Markdown files in `content/posts/` with YAML frontmatter
- **Output** — Static HTML via `next build` with `output: 'export'`
- **Hosting** — S3 + CloudFront
- **Deploy** — GitHub Actions on push to `main`

---

## Architecture

```
app/
  layout.tsx          Root layout — loads globals.css
  page.tsx            Post index — builds post list at build time, passes to PostList
  posts/[slug]/
    page.tsx          Individual post — generateStaticParams + marked render
  components/
    Header.tsx
    Footer.tsx
    PostList.tsx      "use client" — tag filter UI
    PostCard.tsx

lib/
  posts.ts            Vendored post loader — reads content/posts/*.md, parses frontmatter

content/
  posts/              *.md files — one per post

docs/
  architecture.md     Stack decisions, hosting, deploy pipeline
  ui.md               Page inventory, slot diagrams, component inventory

skills/
  ui/SKILL.md         UI conventions — read before touching any page or component

.github/
  workflows/
    deploy.yml        Build + S3 sync + CloudFront invalidation
```

---

## Content Model

Posts are `.md` files with YAML frontmatter:

```markdown
---
title: My Post Title
date: 2026-05-08
tags: [tech, travel]
summary: One-line teaser shown on index.
---

Post body in markdown...
```

Slug = filename without `.md`.

---

## Code Conventions

- `const` over `let`; never `var`
- Ternary over `if/else` for assignments; early returns over nesting
- No unnecessary dependencies — 4 runtime deps total: `next`, `react`, `react-dom`, `marked`
- Plain CSS in `app/globals.css` — no Tailwind, no CSS framework
- No `next/image` — static export, use plain `<img>` with S3/CloudFront URLs
- `"use client"` only where interactivity is needed (PostList tag filter)

---

## Adding a New Post

1. Create `content/posts/<slug>.md` with frontmatter
2. `git push` → GitHub Actions builds + deploys automatically

## Adding a New Page

1. Read `skills/ui/SKILL.md` and `docs/ui.md` first
2. **Update `docs/ui.md` page inventory before writing any code**
3. Create `app/<route>/page.tsx`
4. Add nav link in `app/components/Header.tsx` if needed

## Changing the Layout

1. Read `skills/ui/SKILL.md` and `docs/ui.md`
2. **Show current slot diagram and confirm change before touching code**
3. Update `docs/ui.md` first
4. Then update the component

---

## Deploy

Push to `main` → GitHub Actions:
1. `npm ci`
2. `npm run build` (generates `out/`)
3. `aws s3 sync out/ s3://<bucket> --delete`
4. CloudFront invalidation

AWS credentials stored as GitHub Actions secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`.

---

## Static Export Constraints

`output: 'export'` means:
- No API routes
- No server-side file reads at request time (build-time only)
- No `next/image` optimization
- Tag filtering is client-side React state

---

_Last updated: 2026-05-08_
