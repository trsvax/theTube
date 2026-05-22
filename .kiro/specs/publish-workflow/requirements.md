# Publish Workflow — Requirements

## What this is

The lifecycle of a post from creation to public visibility. How content moves from "I'm working on this" to "people can find this" — and how access is enforced at every stage.

---

## The two states

| State | Meaning | Feed visibility | URL accessibility |
|-------|---------|-----------------|-------------------|
| `workflow: draft` | Work in progress | Not in any index.json | URL exists, accessible based on `audience` |
| `workflow: published` | Done, discoverable | In the appropriate role-scoped index.json | Same as draft — URL accessible based on `audience` |

`workflow` controls discoverability (feeds). `audience` controls access (who can reach the URL at all).

---

## The fields

### `workflow` (required)

Controls whether the post appears in index.json feeds.

- `draft` — has a URL, not in any feed. Shareable by direct link only.
- `published` — in the index.json for the post's audience role.

Extensible later: `review`, `scheduled`, etc. The build rule is simple: if it's not `published`, it's not in any feed.

### `audience` (required, default: public)

Controls who can access the post — both the feed entry and the HTML itself.

| Value | Who can access | URL path |
|-------|---------------|----------|
| `public` | Everyone | `/posts/slug` (no auth) |
| `user` | Any logged-in user | `/user/posts/slug` (requires valid JWT) |
| `kids` | `kids` Cognito group | `/kids/posts/slug` (requires JWT with kids group) |
| `friends` | `friends` Cognito group | `/friends/posts/slug` (requires JWT with friends group) |

**This is a change from today.** Currently all post HTML lives at `/posts/slug` regardless of audience. The new model puts role-gated posts under role-gated paths so CloudFront enforces access at the URL level.

### `id` (optional — required when comments are enabled)

A UUID v4, assigned once, never changes. Stable identifier that survives slug renames.

Currently needed for: comments (keyed by post ID, not slug). Generated when `[comment]:` block is added to a post. Posts without comments don't need one yet.

```yaml
id: 550e8400-e29b-41d4-a716-446655440000
```

Future uses (analytics, cross-references) can trigger a backfill migration when needed.

---

## URL routing

All content lives under its role directory. The role is the top-level namespace.

```
/{role}/posts/{slug}     → post HTML (auth enforced by role)
/{role}/index.json       → feed listing for that role
/index.json              → root manifest (lists all roles)
```

### Examples

```
/public/posts/ai-lost-my-homework    → no auth
/public/index.json                    → no auth
/user/posts/github-app-publishing     → requires valid JWT
/user/index.json                      → requires valid JWT
/friends/posts/family-trip            → requires JWT + friends group
/friends/index.json                   → requires JWT + friends group
```

The homepage (`/`) stays at root as the UI that reads these files. It's a viewer, not content.

`/posts/slug` becomes a legacy redirect to `/public/posts/slug` for backward compatibility with existing links.

---

## The publish action

Publishing is: change `workflow: draft` to `workflow: published` and push.

That's it. The build picks it up, generates the index.json with the new entry, deploys. No separate publish command, no workflow trigger, no approval step.

Unpublishing is the reverse: `workflow: published` → `workflow: draft`. The post disappears from feeds on next build. The URL still works for anyone who has it (and has the right role).

---

## Build changes required

1. **`lib/posts.ts`** — when generating static pages, output role-gated posts to `out/{role}/posts/{slug}.html` instead of `out/posts/{slug}.html`
2. **`scripts/build-indexes.mjs`** — already done (checks `workflow === "published"`)
3. **`next.config.ts`** — may need path rewriting for the `/{role}/posts/{slug}` pattern
4. **Post creation** — generate UUID and add `id` field to frontmatter

---

## Migration

### UUID assignment

All existing posts need a UUID. One-time migration script:
- Generate a UUID v4 for each post
- Add `id: <uuid>` to frontmatter
- Commit as a batch

### URL migration (role-gated posts)

Posts currently at `/posts/slug` with `audience: user|kids|friends` need to move to `/{role}/posts/slug`. This requires:
- CloudFront redirect from old URL to new URL (for any shared links)
- Or: keep `/posts/slug` as a redirect to `/{role}/posts/slug`

### Existing published/draft status

Review all posts after deploy to confirm `workflow` field is correct. Some posts may have been mechanically migrated wrong.

---

## Resolved decisions

- **Journal feed** — journals go in the same `index.json` as posts and thoughts. `type` is a UI filter. Split later if needed.
- **UUID enforcement** — not at build time. Generated when `[comment]:` is added. Backfill later if other systems need it.
- **Slug renames** — add the old slug as an alias (same mechanism as short URLs in `cf-short-urls.js`). The redirect is already built.

---

## Relationship to other specs

- **Platform spec** — this refines the content model section (adds `workflow`, `id`, changes URL routing)
- **Journal-to-spec** — journal entries use this workflow like any other post
- **Comments** — will key off `id` instead of slug
