# UI

## Page Inventory

| Page    | Route           | Component                   | Description                  |
| ------- | --------------- | --------------------------- | ---------------------------- |
| Index   | `/`             | `app/page.tsx`              | All posts, filterable by tag |
| Post    | `/posts/[slug]` | `app/posts/[slug]/page.tsx` | Individual post              |
| Blog    | `/blog`         | `app/blog/page.tsx`         | Blog post index (alias)      |
| About   | `/about`        | `app/about/page.tsx`        | About page                   |
| Contact | `/contact`      | `app/contact/page.tsx`      | Contact page                 |
| Links   | `/links`        | `app/links/page.tsx`        | Curated links (blogroll)     |

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

### Colors

| Name          | Hex       | Role                    |
| ------------- | --------- | ----------------------- |
| Warm Midnight | `#2A0002` | Text, headings, dark bg |
| Sunshine      | `#F18636` | Accent, buttons, hover  |
| Open Sky      | `#455978` | Links, muted text, nav  |
| Enamel        | `#F1E1D5` | Background (light mode) |

Light mode: Enamel bg, Warm Midnight text, Open Sky links, Sunshine accent.
Dark mode: Warm Midnight bg, Enamel text, Sunshine accent.

### Fonts

| Typeface                    | Weight/Style | CSS                                                            | Use               |
| --------------------------- | ------------ | -------------------------------------------------------------- | ----------------- |
| Swear Display Black         | 900 normal   | `var(--font-display)` + `font-weight: 900`                     | Logo, headlines   |
| Swear Display Cilati        | 400 italic   | `var(--font-display)` + `font-style: italic`                   | Headline emphasis |
| Swear Display Medium Cilati | 500 italic   | `var(--font-display)` + `font-weight: 500; font-style: italic` | Subheads          |
| Poppins Light               | 300          | `var(--font-body)`                                             | Body copy         |

- No Tailwind — plain CSS in `app/globals.css`
- Max content width: `680px`, centered
- Images: plain `<img>` tags, S3/CloudFront URLs, `max-width: 100%`
- No dark mode toggle — respects OS `prefers-color-scheme` via CSS media query

## Branding Assets

All assets live locally in `theTube/branding/` (gitignored). Files for web use are SVG and PNG.

### Logo variants

| Variant         | Light Mode | Dark Mode | One Color (Black) |
| --------------- | ---------- | --------- | ----------------- |
| Primary Logo    | SVG, PNG   | SVG, PNG  | SVG, PNG          |
| Horizontal Logo | SVG, PNG   | SVG, PNG  | SVG, PNG          |
| Logo Mark       | SVG, PNG   | SVG, PNG  | SVG, PNG          |
| Type Mark       | SVG, PNG   | SVG, PNG  | SVG, PNG          |

SVG paths (relative to `theTube/branding/Logo Files/`):

- `Primary Logo/Light Mode/SVG/The Tube_Primary Logo_Light Mode.svg`
- `Primary Logo/Dark Mode/SVG/The Tube_Primary Logo_Dark Mode.svg`
- `Horizontal Logo/Light Mode/SVG/The Tube_Horizontal Logo_Light Mode.svg`
- `Horizontal Logo/Dark Mode/SVG/The Tube_Horizontal Logo_Dark Mode.svg`
- `Logo Mark/Light Mode/SVG/The Tube_Logo Mark_Light Mode.svg`
- `Logo Mark/Dark Mode/SVG/The Tube_Logo Mark_Dark Mode.svg`
- `Type Mark/Light Mode/SVG/The Tube_Type Mark_Light Mode.svg`
- `Type Mark/Dark Mode/SVG/The Tube_Type Mark_Dark Mode.svg`

To use a logo on the site: copy the SVG into `public/` and reference it as `<img src="/filename.svg">`.

### Fonts

Swear Display (Oh No Type Co.) — 3 styles, web licensed:

| File                                | Weight | Style  |
| ----------------------------------- | ------ | ------ |
| `Swear_Display-Black.woff2`         | 900    | normal |
| `Swear_Display-Cilati.woff2`        | 400    | italic |
| `Swear_Display-Medium_Cilati.woff2` | 500    | italic |

Font files are in `public/fonts/` (gitignored locally, served from S3 in CI). `@font-face` rules are in `app/globals.css`. Use via `var(--font-display)` in CSS.

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
