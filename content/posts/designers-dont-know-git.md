---
title: Designers Don't Know Git
date: 2026-05-14
tags: [tech]
audience: user
summary: So the post is the spec. What you write in the markdown file determines what gets built around it — including the brief for the designer.
issueNumber: 7
discussionNumber: 9
redirectFrom: /posts/the-post-is-the-spec
---

[design]: og-image.png — 1200×630, brand colors, title prominent
alt: The Post Is the Spec
src: data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjYzMCIgdmlld0JveD0iMCAwIDEyMDAgNjMwIj4KICA8cmVjdCB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MzAiIGZpbGw9IiNmNWY1ZjUiLz4KICA8cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iMTE5MiIgaGVpZ2h0PSI2MjIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2NjYyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSI4IDQiLz4KICA8dGV4dCB4PSI2MDAiIHk9IjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjMyIiBmaWxsPSIjYmJiIj5vZy1pbWFnZS5wbmc8L3RleHQ+CiAgPHRleHQgeD0iNjAwIiB5PSIyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI1IiBmaWxsPSIjODg4Ij4xMjAww5c2MzAsIGJyYW5kIGNvbG9ycywgdGl0bGUgcHJvbWluZW50IFtkZXNpZ25dOjwvdGV4dD4KICA8dGV4dCB4PSI2MDAiIHk9IjMxNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjUiIGZpbGw9IiM4ODgiPmhlcm8ucG5nIOKAlCBjaWdhci5jb20gc2VjdGlvbiwgdXNlIHRoZSAxOTk3IHNjcmVlbnNob3Q8L3RleHQ+CiAgPHRleHQgeD0iNjAwIiB5PSIzNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI1IiBmaWxsPSIjODg4Ij5gYGA8L3RleHQ+Cjwvc3ZnPg==
Post title large, tagline "Designers don't know git!" below in lighter weight.

Most content workflows separate the writing from the project management. You write in one tool, track tasks in another, brief collaborators in a third. The post and the work around it live in different places — sometimes different systems entirely.

This site does it differently. The markdown file is the spec.

## How it works

When a post is pushed, a GitHub Action reads the file. It creates a parent issue as the canonical permalink, a tracking sub-issue for the creation lifecycle, and a discussion sub-issue that stays open for reader comments. The issue numbers are written back to the frontmatter — so the file knows its own issues, and the published post can link directly to the discussion.

But the post can also drive additional work. A line in the body:

```
[design]: og-image.png — 1200×630, brand colors, title prominent
```

Creates a design sub-issue with that brief. The brief can be as long as it needs to be — any markdown, ending at the first blank line:

```
[design]: og-image.png — 1200×630, brand colors, title prominent
The tagline should sit below the title in a lighter weight.
Reference the 2024 rebrand deck attached to issue #3.
```

The parser opens a block on `[design]:`, collects continuation lines, closes on the blank line, and emits an issue. Simple state machine.

The designer gets an issue with the brief included, a place to attach the deliverable, and a clear close condition. Everything tracked, nothing in email. And because the brief names the file, you can reference it in the post body before it's done:

```html
<img src="/images/posts/my-post/og-image.png" alt="..." />
```

The workflow generates an SVG placeholder at that path when the issue is created — correct dimensions, brief text rendered inside. When the designer delivers, the real image replaces it. Nothing else to do.

The designer doesn't need to know what an og-image is or where it ends up. They get a brief and a place to deliver. That's the gig.

The filename is the contract between the brief and the post. Without it, the designer delivers `logo-newest-better-really-FINAL.png`, you spend twenty minutes tracking down what to reference, and then get it wrong.

Two lines = two issues:

```
[design]: og-image.png — 1200×630, brand colors, title prominent
[design]: hero.png — cigar.com section, use the 1997 screenshot
```

The post body tells the workflow what to create. No separate configuration. No project management tool. No briefing document that lives somewhere else.

## The post is the source of truth

The writing, the tasks, the briefs, the history — all of it traces back to the markdown file. The git log shows when the brief was added. The issue shows when it was delivered. The post shows the final result.

This is the same discipline software teams apply to code: the spec lives next to the implementation. A requirement buried in a Confluence page nobody reads is a requirement that gets missed. A `[design]:` line in the post file is a requirement that ships with the work.

## What else can drive the workflow

The pattern is extensible. `[design]:` creates a design issue. `[task]:` could create a general task. `[review]:` could request a specific reviewer. The workflow reads the markers; the markers say what needs to happen.

The post is still just markdown. It renders normally. The `[design]:` lines don't appear on the published page — they're consumed by the workflow and gone. The reader sees the post. The workflow sees the spec.

The browser is one of several readers. The deploy pipeline reads the `shortSlug` to generate a CloudFront redirect function. The issue workflow reads the body to create and track work. Git reads the whole file to preserve history. Each one takes what it needs and does its thing.

Most tools own the data. The app holds the content, and everything else has to ask it for permission. Here the file owns itself. The tools are readers, not owners.

The spec is precise enough to brief a designer. Precise enough that AI wrote the code to do it.

One file. Many readers.

[journey]:
Started by writing the SVG placeholder to a file in `public/` — obvious, simple. Hit the S3 content-type bug: the bucket serves by extension, so SVG content named `.png` came back wrong. Switched to base64 data URLs embedded in the `<img>` src — no file, no content-type problem. Then the bigger realization: `[design]:` is already the image. It has the filename, the dimensions, the alt. No separate `<img>` tag needed — the block IS the tag. The workflow patches `src:` in. Then: why write back at all until the designer delivers? The issue tracks the work. The file updates once, when the real image arrives.
