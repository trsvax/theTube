# Voice Skill

Writing voice and code style for Barry Books / trsvax. Use when drafting posts, editing copy, or writing code for theTube.

## What theTube is

A journal. Not a blog. Travel and tech are categories of the same thing — entries in a running record of work and life, not separate modes with separate voices.

Tech posts need a person in them: the specific frustration that started it, the dead end, the thing that finally worked. "I had to dig through 50 images trying to find the right one" is the post. A tutorial on file naming conventions is not. The posts that age are the ones with a person in them. Documentation is obsolete when the API changes.

The `[journey]:` block exists for this reason — the making-of belongs in the post, not in a separate write-up nobody reads.

## On using AI

The work is Barry's — the decisions, the aesthetic, the direction. AI is in the tool chain, not the byline. Steve Jobs had employees. No disclaimers, no "written with AI" disclosures. When AI is relevant to the subject of a post, mention it the way the copilot-commit-messages post does: unsentimental, specific, honest about the tradeoff.

---

## Writing Voice

### Tone

- First person, direct. "I wanted a site that felt dynamic." Not "One might want..."
- Confident but not boastful. States opinions as facts without hedging.
- Dry wit. Self-deprecating in passing ("most of mine are 'did some stuff'"), never performatively.
- No hype. No "exciting" or "powerful" or "seamlessly."

### Sentence structure

- Short declarative sentences. Mix with an occasional longer one for rhythm.
- Start with the concrete, explain afterward. Not "In order to do X, I Y." — "I Y. That gives us X."
- Em-dashes for asides — sparingly.
- No filler openings. Never "In this post, I'll walk you through..."

### Paragraphs

- 2–4 sentences. Shorter for punch, longer for explanation.
- One idea per paragraph.
- No padding. If a sentence doesn't add information, cut it.

### Sections

- `##` headers are statements or short noun phrases, not questions.
- Good: `## The constraint`, `## What didn't work`, `## The happy accident`
- Bad: `## Why did I choose this?`, `## Overview`
- Don't start sections with "In this section..."

### Endings

- Stops when there's nothing left to say. No "Conclusion" section summarising what was just said.
- Last line lands — either a short punchy observation or a quiet statement that earns its place.

### Technical writing

- Leads with the decision, then the reason. Not "Because X, I did Y." — "I did Y. X is why."
- Negatives earn their place: "What I didn't use: no Tailwind, no MDX, no CMS."
- Bullet lists for parallel items only. Prose for reasoning.
- Code blocks for anything that's literally typed.

### Examples

**Good:**

> The constraint: **permissions enforced at the CDN layer, content gated by role, browser does the rest.**

> That's it. No CloudFront signed cookies, no key pairs, no Secrets Manager. Just a JWT.

> It's worth it just for commit messages. It's not going to replace programmers yet but it's better than Google and Stack Overflow.

**Avoid:**

> In conclusion, we can see that this approach offers many benefits for developers looking to build scalable, cost-effective solutions.

---

## Code Style

### TypeScript / JavaScript

- `const` everywhere. Never `let`, never `var`.
- Arrow functions for callbacks and one-liners. Named functions for exported/top-level.
- Ternary for assignments and returns: `const x = a ? b : c`
- Early returns (guard clauses). No nesting when a return ends the branch.
- Short-circuit operators: `??`, `&&`, `||`, `?.` — prefer over explicit `if` where equally clear.
- Chain array methods: `.flat().filter().sort()` — avoid intermediate variables.

### TypeScript specifics

- Explicit interface types for all data shapes. Name them clearly: `PostMeta`, `PostItem`.
- `Record<string, unknown>` for dynamic objects.
- Cast with `as` only when necessary; prefer narrowing.
- No `any`.

### Imports

- Node built-ins with `node:` prefix: `import fs from "node:fs"`.
- Group: built-ins → external packages → local modules.
- Named imports preferred over default where package supports it.

### Dependencies

- Write code before adding a package.
- Built-ins first (`node:fs`, `node:path`, `node:crypto`).
- Only add a dep when it provides substantial complexity reduction native APIs can't cover.
- Current runtime deps: `next`, `react`, `react-dom`, `marked`. Keep it short.

### Comments

- Only for non-obvious decisions. "Vendored frontmatter parser — no external dep needed."
- Never restate what the code already says.
- No JSDoc on internal functions.

### General

- No magic numbers — name them as constants.
- No unused variables or imports.
- Prefer `Set` for deduplication.
- `path.join(process.cwd(), "...")` for file paths.
- No `console.log` left in production code.

### React / Next.js

- `"use client"` only when interactivity is needed.
- No `next/image` — static export, use plain `<img>`.
- Props typed inline with interfaces, not inline object types.
- State: `useState` for UI state, no state management library.

### CSS

- Plain CSS in `app/globals.css`. No Tailwind, no CSS framework.
- `prefers-color-scheme` in CSS only — no JS dark mode toggle.
- Max content width: `680px`, centered.

---

## Commit Messages

Short, lowercase. Accurate enough to find the change later. Barry can't be bothered and that's fine — handing them off produces better output than writing them reluctantly. Same principle as the rest of the site: low activation energy, better result.

- Good: `browser post edits`, `add slashdot section`, `fix auth cookie expiry`
- Bad: `Revise browser-is-the-server: Slashdot, underpants gnomes, web-as-app section`
- Never: conventional commits format (`feat:`, `fix:`, `chore:`)

- Not verbose. Not over-explained.
- Not cautious. Doesn't hedge decisions that were made deliberately.
- Not chatty. Doesn't narrate what it's doing.
- Not clever for its own sake. Wit earns its place or it doesn't appear.
