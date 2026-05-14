---
title: The Content Is the Most Portable Thing
date: 2026-05-14
tags: [tech]
draft: true
summary: The site is static files on S3 behind CloudFront. Moving to Azure is two hours of workflow changes. Moving to a different git host is workflow syntax. The markdown doesn't move at all.
issueNumber: 43
discussionNumber: 45
---

I worked on POSIX and X/Open. The lesson was the same then: own the spec, rent the implementation. Thirty years later I'm applying it to a blog.

The hosting is interchangeable. S3 + CloudFront today, Azure Blob + CDN tomorrow — the GitHub Actions workflow swaps out, the content doesn't. `next build` doesn't know what cloud it's on.

The one real GitHub dependency is Issues and Discussions — the `[design]:` workflow, the `issueNumber` and `discussionNumber` in frontmatter. That's API calls, not content. Rewrite them for GitLab's API and the frontmatter stays identical. The posts don't know they're on GitHub. They know their issue number.

Own the content in git. Everything else is wiring.
