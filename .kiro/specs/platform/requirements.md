# theTube Platform — Requirements

## What this is

theTube is a personal publishing platform built on a single constraint: **static HTML first, everything else optional**. No server, no database, no CMS. Content is Markdown in git repos. The build produces static files. S3 stores them. CloudFront serves them. Auth sits on top without changing any of that.

The architecture is the argument. Every decision demonstrates that the web doesn't need to be as complicated as it usually is.

---

## Design principles

**AI collaboration is the workflow.** This is designed to be built with AI, not just assisted by it. The human role is direction, judgment, and writing. The AI role is code, debugging, and implementation. The journal entry is the interface between them — you write what you want, AI builds it. The skills and specs exist to give AI enough context to do that without constant correction. Suggestions are welcome — if there's a better approach or a missing piece, say so.

**Build as you go, refactor freely.** The platform grows incrementally. Each journal entry is a feature or idea. Each spec is scoped to one thing. Nothing is designed upfront that hasn't been needed yet. The interface between components is kept thin so the internals can move freely — iterate toward the right structure instead of predicting it. See: [a-fork-is-a-refactor](/posts/a-fork-is-a-refactor).

**Static HTML first.** The site works in Lynx. CSS is for presentation, JS is for enhancement, auth is for gating. Each layer is optional — removing it doesn't break the layer below. The HTML stands on its own.

**The constraint is the point.** Every architectural decision is an argument that the web doesn't need to be as complicated as it usually is. No server, no database, no CMS — not because they're bad, but because they're not needed here. The absence is deliberate.

**One dollar a month.** Infrastructure cost is a design constraint. S3 + CloudFront at personal-site scale costs almost nothing. Complexity that adds cost without adding value doesn't belong here.

**Own what you write.** Content is plain Markdown in git. No proprietary format, no export button, no lock-in. If the site disappears, the writing doesn't.

---

Any content source that wants to participate in the platform must produce two things:

1. **Static HTML** — built files synced to an S3 path (e.g. `/`, `/books/tapestry-nocode/`)
2. **`content.json`** — a manifest of items at that path, in this shape:

```json
{
  "version": 1,
  "role": "public",
  "items": [
    {
      "type": "post",
      "slug": "my-post",
      "title": "My Post",
      "date": "2026-05-16",
      "tags": ["tech"],
      "summary": "One-line teaser."
    }
  ]
}
```

That's the interface. Any tool that speaks this format can participate. The front end doesn't care what built it.

---

## site.json — the master manifest

`site.json` at the S3 root lists all content sources. The front end fetches it to know what sections exist and what role is required to access each.

```json
{
  "updated": "ISO timestamp",
  "sections": [
    {
      "slug": "public",
      "contentUrl": "/public/content.json",
      "role": "public"
    },
    { "slug": "user", "contentUrl": "/user/content.json", "role": "user" },
    { "slug": "kids", "contentUrl": "/kids/content.json", "role": "kids" },
    {
      "slug": "friends",
      "contentUrl": "/friends/content.json",
      "role": "friends"
    },
    {
      "slug": "tapestry-nocode",
      "contentUrl": "/books/tapestry-nocode/content.json",
      "role": "public"
    }
  ]
}
```

Adding a new content source = deploy it first, then add its entry to `SECTIONS` in `scripts/aggregate-site.mjs` and run the aggregate workflow.

---

## Repos

| Repo                          | Purpose                                     | Deploys to                             |
| ----------------------------- | ------------------------------------------- | -------------------------------------- |
| `trsvax/theTube`              | App code, public posts, docs, `site.json`   | `/` (S3 root)                          |
| `trsvax/theTube-content`      | Public post content                         | merged into theTube build              |
| `trsvax/thetube-private`      | Private content, licensed fonts, Lambda/CDK | merged into theTube build              |
| `trsvax/tapestry-nocode-site` | Tapestry NoCode book renderer               | `/books/tapestry-nocode/`              |
| `trsvax/tapestry-nocode`      | Tapestry NoCode book content                | merged into tapestry-nocode-site build |

Each content source has its own repo, its own build, its own deploy. The format agreement — Markdown, `content.json`, S3 path — is the only coupling.

---

## The build pipeline

Every content source follows the same pattern:

```
git push main
  → GitHub Actions
      - checkout this repo + content repo(s)
      - merge content into build tree
      - npm ci && npm run build  →  out/
      - aws s3 sync out/ s3://<bucket>/<path> --delete
      - CloudFront invalidation at /<path>/*
```

The theTube main build additionally:

- Merges private assets (fonts, protected images) from `thetube-private`
- Runs `scripts/build-indexes.mjs` to generate role-scoped `content.json` files
- Deploys the CloudFront short-URL function

---

## AWS infrastructure

One S3 bucket, one CloudFront distribution. All content sources share them.

**S3** — private bucket, CloudFront is the only entry point via OAC.

**CloudFront behaviors:**

| Path                               | Access                 | Notes                            |
| ---------------------------------- | ---------------------- | -------------------------------- |
| `default (*)`                      | Public                 | All static HTML, fonts, images   |
| `/protected/*`                     | Signed cookie required | Role-gated assets                |
| `/user/*`, `/kids/*`, `/friends/*` | Lambda@Edge auth       | Role-scoped `content.json` files |

**Auth stack:**

- Cognito user pool — Google + email/password sign-in
- Lambda at `auth.thetube.today/callback` — exchanges auth code for JWT, sets cookies
- Lambda@Edge on viewer requests to `/user/*`, `/kids/*`, `/friends/*` — validates JWT, checks group membership, returns 403 if unauthorized
- Cognito public keys hardcoded in Lambda@Edge — no network call at edge time

**Roles:**

| Role      | Access                                      |
| --------- | ------------------------------------------- |
| `public`  | Everyone, no login                          |
| `user`    | Any Cognito account (self-signup open)      |
| `kids`    | Cognito `kids` group — manually assigned    |
| `friends` | Cognito `friends` group — manually assigned |

---

## Content model

Posts are `.md` files with YAML frontmatter. The slug is the filename without `.md`.

**Required:** `title`, `date`, `tags`, `summary`
**Optional:** `image`, `bsky`, `draft`, `audience`, `type`, `shortSlug`

`audience` routes the post into the right role-scoped `content.json`. Default: `public`.

`type` controls how the post is treated: `post` (default), `thought`, `draft` (excluded from index). `journal` is reserved for in-progress thinking — excluded from `content.json`, rendered at `/journal`.

Posts start at `audience: user` while in progress, flipped to `audience: public` when ready.

---

## The front end

`PostList` is a `"use client"` component. On load it:

1. Reads the `thetube_roles` cookie to know which feeds to fetch
2. Fetches each accessible `content.json` in parallel
3. Merges, deduplicates, and sorts by date
4. Renders the list with client-side tag filtering

The browser does the dynamic work. The build produces static assets. No server needed.

---

## Adding a new content source

1. Create a repo with a build that produces `out/` and `out/content.json`
2. Add a GitHub Actions workflow that syncs `out/` to `s3://<bucket>/<path>`
3. Add the section to `SECTIONS` in `scripts/aggregate-site.mjs`
4. Run the aggregate workflow to update `site.json`

The front end picks it up automatically on next load.

---

## Block extensions

Markdown files are extended with `[tag]:` blocks. The design is inspired by XML namespaces.

### Namespace convention

`[namespace:tag]` where the namespace maps to a URL — the owner of that tag's definition and action semantics. `tt:` maps to `thetube.today`. Other namespaces can be defined independently without coordination.

```
[tt:journey]:   →  thetube.today owns the definition of "journey"
[tt:spec]:      →  thetube.today owns the definition of "spec"
[tt:design]:    →  thetube.today owns the definition of "design"
```

### Blocks have actions, not just rendering

A block is an action declaration, not just a display hint. The namespace defines who handles it; the tag defines what to do.

| Block           | Render                | Action                                                      |
| --------------- | --------------------- | ----------------------------------------------------------- |
| `[tt:journey]:` | `<details>` accordion | Running log — accumulates over time, unpolished             |
| `[tt:spec]:`    | `<details>` accordion | Spec conversation — clarifying questions, link to Kiro spec |
| `[tt:design]:`  | `<details>` accordion | Creates a GitHub issue with the block content as the body   |

The `[tt:design]` block is already implemented in `lib/posts.ts` as `[design]:` (unnamespaced). It renders as an `<img>` tag when a `src:` is present, and creates a GitHub sub-issue from the block content during the build/publish workflow.

### The file is the unit

One file, whole story. The idea, the spec conversation, the implementation log, the dead ends, the finished writing. Whatever the process was — short or long, clean or messy — it's all in one file. The blocks capture the stages. The file is the record.

The file lives in git. Every change is versioned. The `[commit sha]` inline reference in `[tt:journey]:` blocks links specific moments in the narrative to specific commits. The whole history of an idea is traceable: when it was written, when the spec was added, when the implementation landed, which commits did what. Git is the audit trail.

Five years later you can open the file and reconstruct the whole thing — what you were thinking, what you tried, why you made the call you made, which commit broke it, which commit fixed it. Most codebases lose the reasoning. This keeps it.

Docs go stale because they're written separately from the work. The journal stays current because it _is_ the work — you can't build something without writing about it first. The journal is the source of truth by construction.

The goal is frictionless writing. You write in the file. You don't send emails to request images, you don't open GitHub to create issues, you don't switch to a different tool to generate a spec. You add a block and the tooling handles it.

A markdown file is both the human-readable document and the instruction set for tooling. The same file that renders as a journal entry on the site also drives GitHub issue creation, Kiro spec generation, and Bluesky publishing — depending on which blocks it contains and which tools process it.

### Extensibility

New `[tt:tag]` types can be added by defining their render behavior in `lib/posts.ts` and their action behavior in the relevant workflow or skill. Third-party namespaces are possible without touching theTube code — the namespace URL resolves to the thing that knows how to handle it.

> **Default namespace:** If no prefix is given, `tt:` is assumed. `[journey]:` and `[design]:` are valid shorthand for `[tt:journey]:` and `[tt:design]:` — no migration needed. Explicit prefixes are used when the namespace matters (third-party blocks, or when clarity requires it).

Specific features and problems are handled as journal entries. A journal entry is a finished, polished piece — the distilled account of what was built and why. The `[journey]:` block inside it is the raw log: the chat history, the dead ends, the approaches that didn't work. The journey doesn't need to be polished.

The journal-to-spec workflow converts a journal entry (or in-progress notes) into a targeted Kiro spec. The spec drives implementation. Once shipped, the journey block captures how it actually went.

This keeps the platform spec stable and the feature work incremental.
