# Jolt, Coffee, Prosecco — Effort Tracking

## What this is

A three-number system for tracking effort on journal entries. Replaces story points with something grounded in physical reality.

---

## The three numbers

| Field | Meaning | When set |
|-------|---------|----------|
| ⚡ `jolt` | Estimate — how many sessions will this take? | At `vague-thought → thought` transition |
| ☕ `coffee` | Effort — how many sessions have been spent | Incremented each session by the agent |
| 🥂 `prosecco` | Celebration — how well did it go? | At publish: `max(0, jolt - coffee + 1)` |

---

## Lifecycle integration

```
vague-thought    jolt: 0, coffee: 0, prosecco: 0
     ↓           (decide to finish it)
  thought        jolt: N (estimate set now)
     ↓           (working)
   draft         coffee increments each session
     ↓           (shipped)
 published       prosecco = max(0, jolt - coffee + 1)
```

---

## Requirements

### REQ-1: Jolt is set once

When a post transitions from `vague-thought` to `thought`, the agent sets `jolt:` based on estimated sessions to complete. It never changes after that.

### REQ-2: Coffee increments per session

Each time the agent works on a post (edits it, discusses it substantively), `coffee:` increments by 1. The agent tracks this, not the user.

### REQ-3: Prosecco is derived

When a post reaches `published` status, `prosecco` is set to `(jolt - coffee)² / coffee + 1`. The curve is U-shaped — minimum of 1 when coffee = jolt (nailed the estimate), tending toward infinity as coffee → 0 (celebration) or coffee → ∞ (coping). Both extremes mean more drinking.

### REQ-4: Zero means not started or not applicable

All three fields default to 0. A post at `vague-thought` has all zeros — no estimate, no effort, no celebration. That's fine.

### REQ-5: The gap is the signal

The difference between jolt and coffee tells you whether estimates are accurate. Over time, `grep "jolt:\|coffee:" content/posts/*.md` gives you calibration data. No dashboard needed.

### REQ-6: Agent manages it

The user doesn't manually update these fields. The agent increments coffee when it works on a post, sets jolt at the thought transition, and sets prosecco at publish. The tracking is a convention the agent follows, not automation the user runs.

---

## What this is NOT

- Not a project management tool
- Not enforced — posts without tracking are fine
- Not retroactive — existing posts keep `coffee: 0` unless actively worked on
- Not a dashboard — the data is in frontmatter, queryable with grep

---

## Relationship to journal-to-spec

The journal-to-spec methodology defines the status lifecycle. This spec adds effort metadata to that lifecycle. The two are complementary — status says *where* in the process, jolt/coffee/prosecco says *how much effort* the process took.
