# Content

## Frontmatter Spec

| Field    | Required | Type       | Default | Description                                           |
|----------|----------|------------|---------|-------------------------------------------------------|
| title    | yes      | string     | —       | Display title — post page, PostCard, `<title>`, Bluesky |
| date     | yes      | YYYY-MM-DD | —       | Sort order and display date                           |
| tags     | yes      | array      | —       | e.g. `[tech, travel]` — see Tag Registry below        |
| summary  | yes      | string     | —       | One-line teaser — PostCard and Bluesky link card      |
| image    | no       | URL        | —       | Cover image — `og:image`, Bluesky thumbnail           |
| bsky     | no       | boolean    | false   | Publish to Bluesky on deploy via GitHub Actions       |
| draft    | no       | boolean    | false   | Exclude from index; URL still builds and works        |
| audience | no       | string     | public  | Role gate — routes into JSON index files (see Roles)  |

### Example

```markdown
---
title: Tokyo on a Budget
date: 2026-05-08
tags: [travel]
summary: Three weeks, one carry-on, very little money.
image: https://cdn.thetube.today/posts/tokyo/cover.jpg
bsky: true
draft: false
audience: public
---
```

---

## Tag Registry

| Tag    | Use                        |
|--------|----------------------------|
| tech   | Technical / programming    |
| travel | Travel writing             |
| tg     | TxGang related             |

New tags can be added freely — just use them in frontmatter. They appear automatically in the index tag filter with no code change.

---

## Audience / Roles

| Value  | JSON index file        | Visible to                        |
|--------|------------------------|-----------------------------------|
| public | `public-index.json`    | Everyone (default)                |
| kids   | `kids-index.json`      | Kids + anyone with CloudFront cookie |
| friends| `friends-index.json`   | Friends + anyone with CloudFront cookie |

The index page (`PostList`) fetches whichever JSON files the current visitor can reach. Posts only appear if their index file is accessible. Content files for non-public posts should live in the private repo.

> **Note:** Role-based index files are a planned feature — not yet implemented.

---

## Callout Inventory

Syntax: `> [!TYPE]` or `> [!TYPE arg=value arg2=value]` on the first line of a blockquote.

| Type    | Color               | Purpose                         | Supported Args  |
|---------|---------------------|---------------------------------|-----------------|
| NOTE    | Open Sky `#455978`  | General info worth highlighting | —               |
| WARNING | Sunshine `#f18636`  | Watch out / gotcha              | —               |
| TIP     | Green `#4a7c59`     | Helpful hint or shortcut        | —               |
| TLDR    | Warm Midnight `#2a0002` | Summary at top of long post | —               |
| TRAVEL  | Warm earthy `#8b5e3c` | Practical travel info         | `visa`, `cost`  |
| GEAR    | Muted gray `#6b7280` | Tools / equipment used         | —               |

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

## Shortcode Inventory

Inline shortcodes using `[!SHORTCODE args]` syntax (not inside a blockquote).

| Shortcode | Required Args | Optional Args                          | Output                                 |
|-----------|---------------|----------------------------------------|----------------------------------------|
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
