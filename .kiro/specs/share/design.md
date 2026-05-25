# Design — Share System

## Phase 1 implementation

Phase 1 is self-contained: block renderer, CSS, iOS Shortcut. No Lambda, no new infrastructure.

---

## `[share]:` block renderer

Add to `renderDesignBlocks` in `lib/posts.ts` (rename the function or extract a general block renderer).

### Parser behavior

Pattern: `/^\[share\]:/` at start of line (outside code fences).

Consume subsequent non-blank lines as key-value pairs (`key: value`). Stop at blank line.

### Render rules

| Condition | Output |
|-----------|--------|
| `src:` present | `<figure class="share-image"><img src="{src}" alt="{caption}"><figcaption>{caption} · {captured}</figcaption></figure>` |
| `src:` absent | Strip entirely (v1) or render placeholder (stretch) |

Use `<figure>` instead of bare `<img>` — the caption is meaningful context (what you thought when you captured it).

### Placeholder (stretch)

```html
<figure class="share-placeholder">
  <div class="share-placeholder-inner">
    <span class="share-file">{file}</span>
    <span class="share-caption">{caption}</span>
    <time>{captured}</time>
  </div>
</figure>
```

CSS in `globals.css`:
```css
.share-placeholder {
  border: 2px dashed var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  opacity: 0.6;
}
.share-placeholder-inner { display: flex; flex-direction: column; gap: 0.25rem; }
.share-file { font-family: var(--font-mono); font-size: 0.85rem; }
.share-caption { font-style: italic; }
```

### Strip agent blocks

While adding share block parsing, also strip `[claude]:` and `[kiro]:` blocks from rendered output. Same pattern: consume lines until blank line, emit nothing.

---

## iOS Shortcut: "Save to Tube"

### Flow

```
Share Sheet input (image/URL/text)
  → Determine type (image | link | note)
  → Get filename (or generate from URL/text)
  → Get current date (ISO format)
  → Prompt for caption (optional, skip if empty)
  → URL-encode all values
  → POST https://thetube.today/tube/share/add?type={type}&file={file}&date={date}&caption={caption}
    Headers: Authorization: Bearer {token}
  → Show notification: "Saved to Tube"
```

### Token storage

The JWT lives in a Shortcuts text variable or Keychain item named `thetube-share-token`. Long-lived (1 year expiry or no expiry). Generated manually once — no refresh flow needed for Phase 1.

### Type detection

| Input | Type | File |
|-------|------|------|
| Image | `image` | Original filename from share metadata |
| URL | `link` | The URL itself |
| Text | `note` | `note-{timestamp}.txt` |

---

## Changes to `lib/posts.ts`

The function `renderDesignBlocks` currently handles `[design]:`, `[journey]:`, and `[comment]:`. Rename to `renderBlocks` and add:

1. `[share]:` — render as `<figure>` or strip
2. `[claude]:` — strip (never render)
3. `[kiro]:` — strip (never render)

The block parsing pattern is the same for all: detect tag at line start, consume key-value lines until blank, decide what to emit.

---

## No infrastructure changes

- CF function already returns 202 for `/tube/*?*` — no change needed
- No Lambda for Phase 1
- No S3 writes for Phase 1
- No new CloudFront behaviors

The only code changes are in `lib/posts.ts` and `globals.css`.
