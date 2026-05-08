# UI

## Page Inventory

| Page  | Route           | Component                   | Description                  |
| ----- | --------------- | --------------------------- | ---------------------------- |
| Index | `/`             | `app/page.tsx`              | All posts, filterable by tag |
| Post  | `/posts/[slug]` | `app/posts/[slug]/page.tsx` | Individual post              |

## Slot Order — Index Page

```
┌─────────────────────────────┐
│ Header (site title + nav)   │
├─────────────────────────────┤
│ Tag filter bar              │
├─────────────────────────────┤
│ Post list                   │
│  ┌───────────────────────┐  │
│  │ date · tags           │  │
│  │ Title                 │  │
│  │ Summary               │  │
│  └───────────────────────┘  │
│  ...                        │
├─────────────────────────────┤
│ Footer                      │
└─────────────────────────────┘
```

## Slot Order — Post Page

```
┌─────────────────────────────┐
│ Header (site title + nav)   │
├─────────────────────────────┤
│ Post title                  │
│ date · tags                 │
├─────────────────────────────┤
│ Post body (markdown → HTML) │
├─────────────────────────────┤
│ ← Back to all posts         │
├─────────────────────────────┤
│ Footer                      │
└─────────────────────────────┘
```

## Component Inventory

| Component  | File                          | Purpose                                         |
| ---------- | ----------------------------- | ----------------------------------------------- |
| `Header`   | `app/components/Header.tsx`   | Site title, nav links                           |
| `Footer`   | `app/components/Footer.tsx`   | Simple footer                                   |
| `PostList` | `app/components/PostList.tsx` | Client component — tag filter + post cards      |
| `PostCard` | `app/components/PostCard.tsx` | Single post teaser (date, tags, title, summary) |

## Visual Conventions

- Max content width: `680px`, centered
- Body font: system font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`)
- Monospace font: system mono (`ui-monospace, 'Cascadia Code', monospace`)
- No dark mode toggle — respects OS `prefers-color-scheme` via CSS media query
- No Tailwind — plain CSS in `app/globals.css`
- Images: plain `<img>` tags, S3/CloudFront URLs, `max-width: 100%`

## Tag Conventions

| Tag      | Use                           |
| -------- | ----------------------------- |
| `tech`   | Technical / programming posts |
| `travel` | Travel writing                |
| `tg`     | TxGang related                |

New tags can be added freely — no registration needed, just use them in frontmatter.

## Adding a New Page

1. Update this file first — add a row to the Page Inventory and a slot diagram
2. Create `app/<route>/page.tsx`
3. Add a nav link in `app/components/Header.tsx` if it should appear in nav
4. Static pages: export `generateStaticParams` if the route is dynamic
