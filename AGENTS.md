# AGENTS.md

Guidance for automated agents working in this repository.

## Don't make assumptions. If you don't know something, say so.

---

## Project Overview

theTube is a personal blog — technical posts and travel writing.

**Goal: enhance the old-school web without breaking it.** Static HTML first, CSS for presentation, JS for enhancement, auth for gating — each layer optional, none required for the one below. Permissions are enforced at the CDN layer (CloudFront) and through role-based JSON index files fetched client-side. The browser does the dynamic work; the build produces static assets.

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
    PostList.tsx      "use client" — tag filter UI (hash-based URL state)
    PostCard.tsx

lib/
  posts.ts            Vendored post loader — reads content/posts/*.md, parses frontmatter

content/
  posts/              *.md files — public posts only

site.json             Master content manifest — committed artifact, synced to S3 root

scripts/
  aggregate-site.mjs  Regenerates site.json from the SECTIONS registry
  aws-setup.sh        One-time AWS infrastructure provisioning script
  build-indexes.mjs   Generates out/content.json for the public section after build

docs/
  architecture.md     Stack decisions, hosting, deploy pipeline
  ui.md               Page inventory, slot diagrams, component inventory
  content.md          Frontmatter spec, callout inventory, shortcode inventory
  aws-setup.md        One-time AWS infrastructure setup (S3, CloudFront, IAM, DNS)

skills/
  ui/SKILL.md         UI conventions — read before touching any page or component
  post/SKILL.md       Post authoring — read before creating or editing a post

.github/
  workflows/
    deploy.yml        Build + S3 sync + CloudFront invalidation (skips site.json-only commits)
    aggregate.yml     Manual workflow — regenerates site.json and syncs to S3
```

### Multi-repo structure

| Repo                          | Visibility | Contains                                                                                           |
| ----------------------------- | ---------- | -------------------------------------------------------------------------------------------------- |
| `trsvax/theTube`              | Public     | App code, public post content, docs, `site.json`                                                   |
| `trsvax/theTube-content`      | Public     | Public posts, about/links pages                                                                    |
| `trsvax/thetube-private`      | Private    | Protected post content, licensed fonts (`public/fonts/`), role-gated images (`public/protected/`) |
| `trsvax/tapestry-nocode-site` | Public     | Tapestry NoCode book builder — deploys to `/books/tapestry-nocode/`                                |
| `trsvax/tapestry-nocode`      | Public     | Tapestry NoCode book content (11 chapters, no code)                                                |

The deploy workflow checks out theTube, theTube-content, and thetube-private, merges private assets into the public build tree, then runs `next build`. Private content never touches the public repo.

---

## site.json Content Contract

`site.json` at the S3 root is the master content manifest. Every content source (blog section, book, etc.) produces a `content.json` at its S3 path. `site.json` lists all sections with their `contentUrl` and required `role`.

```json
{
  "updated": "ISO timestamp",
  "sections": [
    { "slug": "public", "contentUrl": "/public/content.json", "role": "public" }
  ]
}
```

To add a new content source: deploy it first, then add its entry to `SECTIONS` in `scripts/aggregate-site.mjs` and run the **aggregate** workflow.

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

Push to `main` → GitHub Actions (`deploy.yml`):

1. `npm ci`
2. `npm run build` (generates `out/`)
3. `aws s3 sync out/ s3://<bucket> --delete`
4. CloudFront invalidation

`deploy.yml` has `paths-ignore: ['site.json']` — site.json-only commits do not trigger a full build.

To update `site.json` (e.g. after a new content source deploys), run the **aggregate** workflow manually from the Actions tab. It regenerates `site.json`, syncs it to S3, and commits the update.

AWS credentials stored as GitHub Actions secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`.

---

## Static Export Constraints

`output: 'export'` means:

- No API routes
- No server-side file reads at request time (build-time only)
- No `next/image` optimization
- Tag filtering is client-side React state

---

_Last updated: 2026-05-16_
