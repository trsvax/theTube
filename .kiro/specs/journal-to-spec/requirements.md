# Requirements Document

## Introduction

theTube needs a working journal section. The `/journal` route exists but is a stub — it renders `PostList`, which is wrong. Journal entries are freeform markdown files with `type: journal` in their frontmatter. They live in the same `content/posts/` directory as regular posts (merged from `theTube-content` and `thetube-private` at build time by the deploy workflow). They need their own index page and detail pages, separate from the main post feed.

A companion Kiro skill (`skills/journal/SKILL.md`) closes the loop: given a journal entry, it reads the file and produces a Kiro spec from it.

## How the app actually works

- Posts are `.md` files in `content/posts/` with YAML frontmatter parsed by `lib/posts.ts`
- `getPosts()` reads all `.md` files, filters out `draft: true` and `type: draft`, sorts by date
- `PostList` is a `"use client"` component that fetches role-scoped `content.json` files at runtime from S3 — it is **not** used for static content like journal entries
- Static pages (About, Links) read markdown at build time and render as server components — journal pages follow this same pattern
- `build-indexes.mjs` generates `out/<role>/content.json` after `next build` — journal entries must be excluded from these files
- The deploy workflow merges content: `cp -r content-repo/content public-repo/content` then `cp -r private-repo/content/posts/. public-repo/content/posts/` — private posts overwrite public ones by filename. The loader sees one flat directory.
- `app/posts/[slug]/page.tsx` is the established pattern for a detail page: `generateStaticParams` + `generateMetadata` + async server component

## Glossary

- **Journal_Entry**: A `.md` file in `content/posts/` with `type: journal` in frontmatter.
- **Post_Loader**: `lib/posts.ts` — reads `content/posts/`, parses frontmatter, renders markdown.
- **Journal_Index**: The page at `/journal` — lists all journal entries.
- **Journal_Detail**: The page at `/journal/[slug]` — renders a single journal entry.
- **Build_Index_Script**: `scripts/build-indexes.mjs` — generates role-scoped `content.json` files.
- **Journal_Status**: Lifecycle state of a journal entry: `idea` | `specced` | `in-progress` | `shipped`.
- **Journal_Skill**: `skills/journal/SKILL.md` — Kiro skill that converts a journal entry into a spec.

---

## Requirements

### Requirement 1: Journal Content Type in the Post Loader

**User Story:** As a developer, I want `lib/posts.ts` to recognize `type: journal` so that journal entries can be loaded separately from regular posts.

#### Acceptance Criteria

1. THE Post_Loader SHALL expose a `JournalMeta` interface that extends `PostMeta` with `status: "idea" | "specced" | "in-progress" | "shipped"` and `specLink?: string`.
2. THE Post_Loader SHALL expose a `getJournalEntries()` function that reads `content/posts/`, returns only files where `type === "journal"` and `draft !== true`, sorted by date descending.
3. WHEN `getPosts()` is called, it SHALL exclude files where `type === "journal"` — the existing filter already excludes `type === "draft"`, and `journal` must be added to that exclusion.
4. THE Post_Loader SHALL expose a `getJournalEntry(slug)` function that reads and renders a single journal entry by slug, returning a `JournalMeta & { html: string }` object. It reuses the existing `parseFrontmatter` and `marked` pipeline already used by `getPost()`.
5. WHEN `getJournalEntries()` reads a file missing a `status` field, it SHALL default `status` to `"idea"`. WHEN it reads a file missing `specLink`, it SHALL default `specLink` to `undefined`.

---

### Requirement 2: Journal Entries Excluded from content.json

**User Story:** As a developer, I want journal entries excluded from the role-scoped `content.json` files so they don't appear in the main `PostList` feed.

#### Acceptance Criteria

1. THE Build_Index_Script SHALL skip any file where `meta.type === "journal"` when building `out/<role>/content.json`. The existing skip condition is `meta.draft === "true" || meta.draft === true || meta.type === "draft"` — `meta.type === "journal"` must be added to this condition.
2. WHEN the build runs, no journal entry SHALL appear in any of `out/public/content.json`, `out/user/content.json`, `out/kids/content.json`, or `out/friends/content.json`.

---

### Requirement 3: Journal Index Page

**User Story:** As a reader, I want `/journal` to list my journal entries so I can browse them separately from polished posts.

#### Acceptance Criteria

1. THE Journal_Index SHALL replace the current stub at `app/journal/page.tsx`, which incorrectly renders `PostList`.
2. THE Journal_Index SHALL be a server component (no `"use client"`) that calls `getJournalEntries()` at build time and renders the list as static HTML — the same pattern as `app/about/page.tsx`.
3. THE Journal_Index SHALL render each entry as a linked card showing: title (linked to `/journal/[slug]`), date, summary, and a status badge when `status` is not `"idea"`.
4. WHEN `getJournalEntries()` returns an empty array, THE Journal_Index SHALL render a message indicating no entries exist yet.
5. THE Journal_Index SHALL use plain CSS classes consistent with the existing post list styles in `app/globals.css` — no new CSS framework, no inline styles except dynamic values.
6. THE Journal_Index SHALL export `metadata` with `title: "Journal — theTube"`.

---

### Requirement 4: Journal Detail Page

**User Story:** As a reader, I want `/journal/[slug]` to render a single journal entry so I can read the full thinking behind a feature idea.

#### Acceptance Criteria

1. THE Journal_Detail SHALL be created at `app/journal/[slug]/page.tsx`, following the same structure as `app/posts/[slug]/page.tsx`.
2. THE Journal_Detail SHALL export `generateStaticParams()` that calls `getJournalEntries()` and returns `{ slug }` for each entry — the same pattern used in `app/posts/[slug]/page.tsx`.
3. THE Journal_Detail SHALL export `generateMetadata({ params })` that returns `{ title: "${entry.title} — theTube" }`.
4. THE Journal_Detail SHALL render: the entry title as `<h1>`, date and tags in a `.post-meta` div, the rendered HTML body in a `.post-body` div, and a `← Journal` back-link to `/journal` in a `.post-footer` div — matching the slot order of the post detail page.
5. WHEN a journal entry has a `specLink` value, THE Journal_Detail SHALL render it as a text reference (e.g., `Spec: .kiro/specs/feature-name`) in the `.post-meta` area — not a navigable link, since spec directories are not served.
6. WHEN a journal entry has `status` other than `"idea"`, THE Journal_Detail SHALL render a status badge in the `.post-meta` area.

---

### Requirement 5: docs/ui.md Updated

**User Story:** As a developer, I want `docs/ui.md` updated to reflect the new journal pages so the page inventory stays accurate.

#### Acceptance Criteria

1. `docs/ui.md` Page Inventory SHALL have a row for `Journal Index` at route `/journal` with component `app/journal/page.tsx`.
2. `docs/ui.md` Page Inventory SHALL have a row for `Journal Detail` at route `/journal/[slug]` with component `app/journal/[slug]/page.tsx`.
3. `docs/ui.md` SHALL include a slot diagram for the Journal Detail page matching the structure described in Requirement 4 AC4.

---

### Requirement 6: Journal-to-Spec Skill

**User Story:** As a developer, I want a Kiro skill that reads a journal entry and produces a Kiro spec from it so I can go from freeform thinking to an actionable implementation plan.

#### Acceptance Criteria

1. THE Journal_Skill SHALL be created at `skills/journal/SKILL.md`.
2. THE Journal_Skill SHALL document the frontmatter fields for a journal entry: required (`title`, `date`, `tags`, `summary`, `type: journal`) and optional (`status`, `specLink`, `audience`, `draft`).
3. THE Journal_Skill SHALL document the recommended body structure for a journal entry: what problem it solves, rough shape of the solution, constraints, open questions, related posts by slug.
4. THE Journal_Skill SHALL define the trigger: when the user says `journal: <path-to-entry>` or `spec this journal entry` with a file open, the skill activates.
5. WHEN activated, THE Journal_Skill SHALL instruct the agent to: (a) read the journal entry file, (b) read `docs/architecture.md`, `docs/content.md`, `docs/ui.md`, and any skill files relevant to the feature area, (c) read any posts referenced by slug in the entry body, (d) produce a Kiro spec using the requirements-first workflow.
6. WHEN the spec is created, THE Journal_Skill SHALL instruct the agent to update the journal entry's frontmatter: set `status: specced` and `specLink: .kiro/specs/<feature-name>`.
7. THE Journal_Skill SHALL note that `<feature-name>` is derived from the journal entry's slug.
8. `skills/post/SKILL.md` SHALL be updated to add a reference to `skills/journal/SKILL.md` for journal entry authoring.
