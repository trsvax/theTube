# Journal Skill

How to write journal entries on theTube and convert them into Kiro specs.

---

## What a journal entry is

A journal entry is a finished piece of writing — not a draft, not notes. It's the published artifact. The `[journey]:` block inside it is the making-of: how you got from idea to implementation.

Journal entries live in `content/posts/` alongside regular posts. The difference is `type: journal` in the frontmatter. They start at `audience: user` and flip to `audience: public` when ready.

---

## Frontmatter

```markdown
---
title: A GitHub App as the Publishing Layer
date: 2026-05-12
tags: [tt:tech]
type: journal
audience: user
summary: One-line description of the idea.
status: vague-thought
specLink:
---
```

**Required:** `title`, `date`, `tags`, `summary`, `type: journal`
**Optional:** `audience` (default: `user`), `status`, `specLink`, `draft`

**`status` values:**

- `vague-thought` — a title, maybe a sentence. Not ready to write about yet, just don't want to lose it.
- `thought` — more formed but not yet being actively worked
- `journaling` — actively in the loop (journal → spec → code)
- `shipped` — done, post written

**`specLink`** — path to the Kiro spec directory once created, e.g. `.kiro/specs/feature-name`

---

## Recommended body structure

No rigid template — write the way the existing posts are written. But a useful journal entry covers:

- **The problem** — what's missing or broken, why it matters
- **The rough shape** — what you think the solution looks like
- **The constraints** — what the platform spec says, what can't change
- **Open questions** — what you don't know yet
- **Related posts** — reference by slug if relevant (e.g. `see: building-the-tube`)

The `[journey]:` block is a running log — add to it as the work progresses. The chat history, the dead ends, the approaches that didn't work, the commits that got reverted. It accumulates over time and doesn't need to be polished. The journal entry is the distilled version; the journey is the receipts.

---

## The trigger: journal → spec

When the user says `journal: <path-to-entry>` or `spec this journal entry` with a journal file open or referenced, this skill activates.

### What to do

1. **Read the journal entry** — extract the problem, rough solution, constraints, open questions
2. **Read the platform spec** — `.kiro/specs/platform/requirements.md`
3. **Read the relevant docs** — `docs/architecture.md`, `docs/content.md`, `docs/ui.md`
4. **Read any referenced posts** — if the entry mentions slugs, read those files from `content/posts/`
5. **Read relevant skills** — `skills/ui/SKILL.md` if it's a UI change, `skills/post/SKILL.md` if it's a content model change
6. **Produce or update a Kiro spec** — use the requirements-first workflow, scoped tightly to what the journal entry describes. The feature name comes from the journal entry's slug. If a spec already exists at `specLink`, update it rather than creating a new one.
7. **Update the journal entry frontmatter** — set `status: journaling` and `specLink: .kiro/specs/<feature-name>`

The spec is iterative. Prototyping will reveal things the journal entry didn't anticipate. When that happens: update the journal entry with what was learned, update the spec to reflect the new understanding, continue. The journey block accumulates the history of those turns.

### What not to do

- Don't invent scope beyond what the journal entry describes
- Don't spec things the platform already handles
- Don't produce a spec for a one-liner code change — just make the change
- Don't ask the user to repeat what's already in the journal entry
- Don't treat the spec as final — it should evolve as the work does

---

## What makes a good spec from a journal entry

The journal entry is the requirements source. A good spec derived from it:

- Is scoped to one enhancement, not a platform rewrite
- References the actual code it touches (`lib/posts.ts`, `build-indexes.mjs`, etc.)
- Reflects the real constraints (static export, no new deps, plain CSS)
- Is small enough to implement in one session

If the journal entry is too vague to spec, capture the clarifying conversation in a `[tt:spec]:` block in the journal entry itself — ask one question, get the answer, add it to the block, then produce the spec. The `[tt:spec]` block is the record of how the idea got sharpened.

---

## Suggestions welcome

Don't just execute. If you see a better approach, a missing piece, or something that doesn't fit the platform principles, say so. The collaboration works best when AI brings judgment, not just implementation.
