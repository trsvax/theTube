# Journal-Driven Development — Spec

## What this is

The methodology for building theTube. Not what gets built (that's the platform spec) — how things get built. The journal entry is the unit of work. Everything flows through it.

---

## The development loop

```
vague idea
    ↓
journal entry ←──────────┐
    ↓                     │
  spec      ←──────┐      │
    ↓               │      │
  code  ────────────┘──────┘
```

The idea is the only one-way gate. After that: write in the journal, produce a spec, write code, learn something, update the journal, update the spec, write more code. The loop runs until it's shipped.

---

## The journal entry is the unit

One file, whole story. The idea, the spec conversation, the implementation log, the dead ends, the finished writing. Whatever the process was — short or long, clean or messy — it's all in one file.

The file lives in git. Every change is versioned. The whole history of an idea is traceable. Five years later you can open the file and reconstruct the what, the why, and the how.

Docs go stale because they're written separately from the work. The journal stays current because it _is_ the work.

---

## Status lifecycle

```
vague-thought → thought → journaling → shipped
```

| Status          | Meaning                                                                              |
| --------------- | ------------------------------------------------------------------------------------ |
| `vague-thought` | A title, maybe a sentence. Not ready to write about yet, just don't want to lose it. |
| `thought`       | More formed but not yet being actively worked.                                       |
| `journaling`    | Actively in the loop — journal → spec → code, iterating.                             |
| `shipped`       | Done.                                                                                |

Status lives in frontmatter: `status: vague-thought`

---

## Blocks inside the journal entry

Blocks are `[tag]:` extensions that capture different stages of the process. Each block can be read by different tools with different objectives.

| Block        | Purpose                                                                                                        |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| `[journey]:` | Running log of the implementation. Chat history, dead ends, commits. Accumulates over time. Unpolished.        |
| `[spec]:`    | The spec conversation — clarifying questions, back-and-forth that sharpened the idea into something buildable. |
| `[design]:`  | Visual asset brief — creates a GitHub issue, renders as placeholder until asset exists.                        |

### The `[journey]:` block

```markdown
[journey]: The journey
prev: previous-slug
next: next-slug
Narrative text. Tried X, didn't work [commit bd3c218].
Switched to Y [commit 940bae0]. That worked.
```

- `prev:` / `next:` — links to other journal entries, forming a graph of connected thoughts
- `[commit sha]` — inline references render as GitHub commit links
- The journey is unpolished by design — it's the raw log, not the published piece

### The thought graph

`prev` and `next` in `[journey]:` blocks form a directed graph. One entry leads to another, branches when thinking forks, converges when threads reconnect. The build has enough information to draw the graph — nodes are entries, edges are journey links.

This graph is the site map. Not `sitemap.xml` for search engines — the actual map of how the thinking moved.

---

## The journal-to-spec conversion

When a journal entry is formed enough to build from, the skill at `skills/journal/SKILL.md` converts it to a Kiro spec.

**Trigger:** `journal: <path>` or `spec this journal entry`

**Process:**

1. Read the journal entry
2. Read the platform spec and relevant docs
3. Read any referenced posts (slugs mentioned in the body)
4. Produce or update a Kiro spec (requirements-first workflow)
5. Update the journal entry frontmatter: `status: journaling`, `specLink: .kiro/specs/<feature-name>`

The spec is iterative. Prototyping reveals things the journal entry didn't anticipate. When that happens: update the journal, update the spec, continue. The journey block accumulates the history of those turns.

If the entry is too vague to spec, the clarifying conversation goes in the `[spec]:` block inside the entry itself.

---

## Frontmatter

```markdown
---
title: You Can't Argue With the Second Law
date: 2026-05-17
tags: [tt:tech]
type: journal
audience: user
status: vague-thought
summary: One-line description.
specLink: .kiro/specs/feature-name
---
```

**Required:** `title`, `date`, `tags`, `summary`, `type: journal`
**Optional:** `audience` (default: `user`), `status` (default: `vague-thought`), `specLink`, `draft`

Entries start at `audience: user` and flip to `audience: public` when ready.

---

## Relationship to the platform spec

The platform spec (`.kiro/specs/platform/requirements.md`) describes what gets built — the content.json contract, the AWS infrastructure, the block extension model.

This spec describes how things get built — the journal entry as the unit of work, the development loop, the thought graph, the conversion workflow.

They reference each other but serve different purposes. The platform spec is stable. This spec evolves as the methodology evolves.
