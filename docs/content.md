# Content

## Frontmatter Spec

| Field    | Required | Type       | Default | Description                                                      |
| -------- | -------- | ---------- | ------- | ---------------------------------------------------------------- |
| title    | yes      | string     | —       | Display title — post page, PostCard, `<title>`, Bluesky          |
| date     | yes      | YYYY-MM-DD | —       | Sort order and display date                                      |
| tags     | yes      | array      | —       | e.g. `[tech, travel]` — see Tag Registry below                   |
| summary  | yes      | string     | —       | One-line teaser — PostCard and Bluesky link card                 |
| type     | yes      | string     | —       | Content type: `journal`, `post`, or `thought` (see Types below)  |
| workflow | yes      | string     | —       | Publication state: `draft` or `published`                        |
| audience | yes      | string     | public  | Role gate: `public`, `user`, `kids`, `friends` (see Roles below) |
| status   | no       | string     | —       | Idea lifecycle — type-specific (see Status below)                |
| image    | no       | URL        | —       | Cover image — `og:image`, Bluesky thumbnail                      |
| bsky     | no       | boolean    | false   | Publish to Bluesky on deploy via GitHub Actions                  |
| coffee   | no       | number     | —       | Coffees consumed while writing                                   |
| origin   | no       | string     | —       | Where the idea came from (e.g. `bike`, `walk`, `shower`)         |
| specLink | no       | string     | —       | Path to Kiro spec directory if one exists                        |
| shortSlug| no       | string     | —       | Short alias for `/a/{shortSlug}` redirect                        |

### Example

```markdown
---
title: Tokyo on a Budget
date: 2026-05-08
tags: [travel]
type: post
summary: Three weeks, one carry-on, very little money.
image: https://cdn.thetube.today/posts/tokyo/cover.jpg
bsky: true
workflow: published
audience: public
---
```

## File Organization

Posts live in `content/posts/YYYY/MM/slug.md`. The date partition is derived from the `date:` frontmatter field. Slug = filename without `.md`. URLs are flat: `/posts/{slug}` — the directory structure is for humans and `ls`, not routing.

---

## Types

| Type      | What it is                                                                 |
| --------- | -------------------------------------------------------------------------- |
| `journal` | A thinking-out-loud entry. Has a lifecycle (status).                        |
| `post`    | A finished piece of writing. No status — it's either draft or published.   |
| `thought` | A one-liner or fragment. No status — it exists or it doesn't.              |

Type determines what `status` means and whether it applies.

---

## Status (journal only)

Status tracks where the *idea* is. Workflow tracks where the *file* is. They're orthogonal.

| Status         | Meaning                                                        |
| -------------- | -------------------------------------------------------------- |
| `vague-thought`| A title, maybe a sentence. Don't lose it, not ready to work.   |
| `thought`      | More formed. Not being actively worked.                        |
| `journaling`   | Actively in the loop — journal → spec → code.                  |

When the work is done, flip `workflow: published`. That's "shipped." No separate status value needed.

Posts and thoughts don't use status. If it's a post, it's either `workflow: draft` (writing it) or `workflow: published` (done). If it's a thought, same — exists or published.

---

## Tag Registry

Plain tags — no prefix needed. They appear automatically in the index tag filter with no code change.

| Tag      | Use                     |
| -------- | ----------------------- |
| `tech`   | Technical / programming |
| `travel` | Travel writing          |
| `tg`     | TxGang related          |

New tags can be added freely in frontmatter.

---

## Audience / Roles

The repo is the privacy boundary:

- **theTube-content** (public repo) → always `audience: public`
- **thetube-private** (private repo) → `audience: user`, `kids`, or `friends`

`workflow: draft` keeps a post out of the index but the URL still works — you can share drafts by sending the link directly.

| Value   | JSON index file         | Visible to                                                                                                                               |
| ------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| public  | `/public/index.json`  | Everyone, no login required. Search-engine indexable.                                                                                    |
| user    | `/user/index.json`    | Anyone with a Cognito account (Google or email signup). Self-signup is open — treat `user` as basically public, just with a door handle. |
| kids    | `/kids/index.json`    | Cognito `kids` group — manually assigned.                                                                                                |
| friends | `/friends/index.json` | Cognito `friends` group — manually assigned.                                                                                             |

`public` = shareable anywhere. `user` = self-selected by willingness to sign up, not a vetted list. `kids` and `friends` are the actually private tiers.

The index page (`PostList`) reads the `thetube_roles` cookie and fetches only the feeds the current visitor can reach. Posts only appear if their index file is accessible.

---

## Blocks

Posts use `[block]:` syntax for structured content. The registry is in [`blocks.md`](../blocks.md) — that's the source of truth for what each block does, how it renders, and where its spec lives.

Registered blocks have behavior (render, strip, or trigger processing). Unregistered blocks pass through as plain text.

---

## Callout Inventory

Syntax: `> [!TYPE]` or `> [!TYPE arg=value arg2=value]` on the first line of a blockquote.

| Type    | Color                   | Purpose                         | Supported Args |
| ------- | ----------------------- | ------------------------------- | -------------- |
| NOTE    | Open Sky `#455978`      | General info worth highlighting | —              |
| WARNING | Sunshine `#f18636`      | Watch out / gotcha              | —              |
| TIP     | Green `#4a7c59`         | Helpful hint or shortcut        | —              |
| TLDR    | Warm Midnight `#2a0002` | Summary at top of long post     | —              |
| TRAVEL  | Warm earthy `#8b5e3c`   | Practical travel info           | `visa`, `cost` |
| GEAR    | Muted gray `#6b7280`    | Tools / equipment used          | —              |

### Adding a new callout type

1. Add a row to this table first
2. Add `.callout-{type}` CSS in `app/globals.css` (border color, background, dark mode variant)
3. Add the type to the renderer in `lib/posts.ts`

### Args example

```markdown
> [!TRAVEL visa=90days cost=$$]
> Fly into Narita. JR Pass worth it if moving around.
```

Args render as small badges inside the callout header.

---

## Journey Block

Appears at the end of a post. Renders as a `<details>` accordion — the making-of, hidden by default.

```markdown
[journey]: The journey
prev: previous-slug
next: next-slug
Narrative text. The regex looked right but LIVE still had old code [commit bd3c218].
The race condition fix came later [commit 940bae0].
```

| Field   | Description                                                        |
| ------- | ------------------------------------------------------------------ |
| `prev:` | Slug of the previous post in the thread (stored, not yet linked)   |
| `next:` | Slug(s) of the next post(s) in the thread (stored, not yet linked) |

Inline commit references: `[commit sha]` anywhere in the narrative text renders as a link to `github.com/trsvax/theTube/commit/<sha>`. Use short (7-char) or full SHAs.

---

## Shortcode Inventory

Inline shortcodes using `[!SHORTCODE args]` syntax (not inside a blockquote).

| Shortcode | Required Args | Optional Args                                 | Output                                    |
| --------- | ------------- | --------------------------------------------- | ----------------------------------------- |
| IMG       | `src`         | `width`, `height`, `float`, `caption`, `role` | Sized/floated `<figure>` + `<figcaption>` |

### Adding a new shortcode

1. Add a row to this table first
2. Add a `marked` extension in `lib/posts.ts`
3. Add CSS in `app/globals.css`

### IMG example

```markdown
[!IMG src="https://cdn.thetube.today/img.jpg" width=220 height=200 float=left caption="Tokyo station"]

[!IMG src="https://cdn.thetube.today/protected/kids/photo.jpg" role=kids caption="Summer trip"]
```

When `role` is set the image is wrapped in `<div class="role-gate" data-role="{role}" style="display:none">`. Client-side JS reveals it if the visitor has the matching role (same cookie check as the index). The `src` points to a protected S3 path — CloudFront requires a signed cookie to serve it, so the asset is protected at the CDN layer regardless of whether the wrapper is hidden.
