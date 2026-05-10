# Post Skill

Domain knowledge for creating and editing posts on theTube.

## Before writing a post

1. Read `docs/content.md` — frontmatter spec, callout inventory, shortcode inventory
2. **Update `docs/content.md` first** if adding a new callout type or shortcode
3. Write the post

## Creating a post

```
1. docs/content.md  — update if adding new callout types or shortcodes
2. content/posts/<slug>.md  — create the file with frontmatter + body
3. git push → GitHub Actions builds, deploys, and posts to Bluesky (if bsky: true)
```

## Slug conventions

- Lowercase, hyphen-separated, no special characters
- Matches filename: `tokyo-on-a-budget.md` → `/posts/tokyo-on-a-budget`
- **Permanent** — never rename after publishing (breaks `at://` links and inbound URLs)

## Frontmatter fields

See `docs/content.md` §Frontmatter Spec for all fields, types, and defaults.

Required: `title`, `date`, `tags`, `summary`
Optional: `image`, `bsky`, `draft`, `audience`

## Callout syntax

Standard blockquote with a `[!TYPE]` tag on the first line:

```markdown
> [!NOTE]
> This is something worth knowing.

> [!TRAVEL visa=90days cost=$$]
> Fly into Narita. JR Pass worth it if you're moving around.
```

- Type is ALL CAPS
- Args are optional, `key=value` pairs space-separated after the type
- Content follows on the next line(s) as normal blockquote text
- Non-matching blockquotes render as normal `<blockquote>`

See `docs/content.md` §Callout Inventory for all types, colors, and supported args.

## Shortcodes

Inline shortcodes for richer content blocks:

```markdown
[!IMG src="https://cdn.thetube.today/img.jpg" width=220 height=200 float=left caption="Tokyo station"]
```

See `docs/content.md` §Shortcode Inventory for all shortcodes and args.

## What frontmatter drives downstream

| Field    | Drives                                                              |
|----------|---------------------------------------------------------------------|
| title    | Post page `<h1>`, PostCard title, page `<title>`, Bluesky card     |
| summary  | PostCard teaser, Bluesky link card description                      |
| date     | Sort order on index, shown on post page and PostCard                |
| tags     | PostCard tag pills, index tag filter (automatic — no code change)   |
| image    | `og:image` meta tag, Bluesky link card thumbnail, PostCard (future) |
| bsky     | Whether GitHub Actions posts to Bluesky on deploy (default: false)  |
| draft    | Excluded from index when true; URL still works for preview          |
| audience | Routes post metadata into role-based JSON index files               |

## Tag conventions

See `docs/content.md` §Tag Registry. New tags can be added freely — no registration needed, just use them in frontmatter and they appear automatically in the index filter.
