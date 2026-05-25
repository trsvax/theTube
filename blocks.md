# Blocks

Registry of `[block]:` extensions. How to use them and where their specs live.

Any `[word]:` is valid syntax in a post. If it's registered here, it has defined behavior — renders, gets stripped, or triggers processing. If it's not here, it passes through as plain text. Use unregistered blocks freely for examples, aspirational ideas, or inline metadata that doesn't need rendering yet.

Multiple entries for the same block merge — like Plan 9's `bind`. The order in the table is the priority. Move a line up or down to change precedence.

This file is not just a table — it's a document. Add notes, rules, explanations anywhere. AI reads it all.

| Block | Usage | Spec |
|---|---|---|
| `[journey]:` | Running log. Add to it as work progresses. Renders as `<details>`. | built-in (`lib/posts.ts`) |
| `[design]:` | Visual asset brief. Renders as `<img>` when `src:` present, placeholder when missing. | built-in (`lib/posts.ts`) |
| `[spec]:` | Published spec. Renders as `<details>`. Content is the public-facing version of a `.kiro/specs/` design. | built-in (planned) |
| `[comment]:` | Enables comments on this post. Renders a comment form and displays existing comments. | [trsvax/thetube-comments](https://github.com/trsvax/thetube-comments) |
| `[comment]:` | Processes comment events from the log, writes comment files. | comment indexer (planned) |
| `[share]:` | Shared media placeholder. Renders as `<img>` when `src:` present, placeholder when missing. Same pattern as `[design]:`. | built-in (planned) |
| `[share]:` | Processes share events from CloudFront logs, populates `src:` on publish. | share processor (planned) |

Multiple repos can respond to the same block. Not a collision — a collaboration. Each reader does its own thing.

The spec URL is for implementation. Day-to-day usage: just add the block to a post. AI knows what to do from this file.

## Agent blocks

`[claude]:` and `[kiro]:` blocks appear in posts but don't render. They're file pointers — each agent has its own way of tracking work (Claude uses `.claude/plans/`, Kiro uses `.kiro/specs/`). The block documents which agent touched the post and where its artifacts live. Not a rendering concern, not a work assignment — just bookkeeping so you can find things.

```markdown
[claude]:
session: 2026-05-23
plan: .claude/plans/tender-bubbling-crystal.md

[kiro]:
spec: .kiro/specs/share
```

Strip these from rendered output. They're metadata for humans and agents, not readers.
