# UI Skill

Domain knowledge for adding or changing pages and UI components in theTube.

## Before touching any UI code

1. Read `docs/ui.md` — the page inventory and slot diagrams are the source of truth
2. **Update `docs/ui.md` first** — add your page/component to the inventory before writing code
3. Make the change
4. If deviating from a convention, add a `why:` note inline in `docs/ui.md`

## Page inventory

See `docs/ui.md` §Page Inventory — every route must have a row there.

## Slot order

The ASCII diagrams in `docs/ui.md` define the visual layout contract. When changing a layout:

1. Show the current ASCII diagram
2. Confirm the intended change with the user
3. Update `docs/ui.md` diagram first
4. Then update the component

## Visual conventions

- Max content width: `680px`, centered via `margin: 0 auto; max-width: 680px; padding: 0 1rem`
- System font stack — never install a font package
- No Tailwind — all styles in `app/globals.css` or component-level `<style>` modules
- No dark mode toggle — `@media (prefers-color-scheme: dark)` in CSS only
- Images: `<img src="..." alt="..." style="max-width:100%">` — no `next/image` (static export)

## Adding a new page

```
1. docs/ui.md  — add row to Page Inventory + slot diagram
2. app/<route>/page.tsx — create page component
3. app/components/Header.tsx — add nav link if needed
4. If dynamic route: export generateStaticParams()
```

## Tag filter (PostList)

`PostList` is a `"use client"` component. Post metadata is passed as props at build time — no fetch needed. Filter state lives in `useState`. Adding a new tag requires no code change — it appears automatically from frontmatter.

## Component locations

| Component | File |
|---|---|
| Header | `app/components/Header.tsx` |
| Footer | `app/components/Footer.tsx` |
| PostList (client, tag filter) | `app/components/PostList.tsx` |
| PostCard | `app/components/PostCard.tsx` |

## CSS conventions

- Global styles: `app/globals.css`
- Component styles: CSS modules (`ComponentName.module.css`) if needed
- Never use inline `style` except for dynamic values
- Dark mode: `@media (prefers-color-scheme: dark) { ... }` blocks at bottom of `globals.css`
