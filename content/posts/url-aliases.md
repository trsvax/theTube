---
title: URL Aliases
date: 2026-05-14
tags: [tech]
draft: true
summary: The post owns its URL surface. shortSlug and redirectFrom are just alias types — the filename is canonical, everything else is a name the post also answers to.
issueNumber: 40
discussionNumber: 42
---

A post has one canonical slug — the filename. Everything else is an alias.

`shortSlug: tube` is a forward alias: human-friendly, shareable, intentional.
`redirectFrom: /posts/old-slug` is a backward alias: history-preserving, automatic, invisible to the reader.

Both are the same thing. Both live in the frontmatter. Both generate CloudFront redirect rules at build time. The post declares all the URLs it answers to; the build wires them up.

The alternative is an external redirect table — a config file somewhere, a database row, a DNS entry managed separately from the content. Those drift. They go stale. Nobody knows which ones are still valid.

If the redirect lives in the post file, it goes away when the post goes away. It's version-controlled with the content. The git log shows when the slug changed and what it was before.

## The unified model

```yaml
shortSlug: tube # /t/tube → canonical
redirectFrom:
  - /posts/the-post-is-the-spec # old slug → canonical
```

One pass at build time. One CloudFront function. All aliases resolved.
