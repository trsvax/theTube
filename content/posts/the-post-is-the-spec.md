---
title: The Post Is the Spec
date: 2026-05-12
tags: [tech]
audience: user
summary: The markdown file drives the workflow. What you write in the post determines what gets built around it.
issueNumber: 7
discussionNumber: 9
---

Most content workflows separate the writing from the project management. You write in one tool, track tasks in another, brief collaborators in a third. The post and the work around it live in different places.

This site does it differently. The markdown file is the spec.

## How it works

When a post is pushed, a GitHub Action reads the file. It creates a parent issue as the canonical permalink, a tracking sub-issue for the creation lifecycle, and a discussion sub-issue that stays open for reader comments.

But the post can also drive additional work. A line in the body:

```
[design]: OG image — 1200×630, brand colors, title prominent
```

Creates a design sub-issue with that brief. The designer gets an issue with the brief included, a place to attach the deliverable, and a clear close condition. Everything tracked, nothing in email.

Two lines = two issues:

```
[design]: OG image — 1200×630, brand colors, title prominent
[design]: Hero image for the cigar.com section — use the 1997 screenshot
```

The post body tells the workflow what to create. No separate configuration. No project management tool. No briefing document that lives somewhere else.

## The post is the source of truth

The writing, the tasks, the briefs, the history — all of it traces back to the markdown file. The git log shows when the brief was added. The issue shows when it was delivered. The post shows the final result.

This is the same discipline software teams apply to code: the spec lives next to the implementation. A requirement buried in a Confluence page nobody reads is a requirement that gets missed. A `[design]:` line in the post file is a requirement that ships with the work.

## What else can drive the workflow

The pattern is extensible. `[design]:` creates a design issue. `[task]:` could create a general task. `[review]:` could request a specific reviewer. The workflow reads the markers; the markers say what needs to happen.

The post is still just markdown. It renders normally. The `[design]:` lines don't appear on the published page — they're consumed by the workflow and gone. The reader sees the post. The workflow sees the spec.

One file. Two audiences.
