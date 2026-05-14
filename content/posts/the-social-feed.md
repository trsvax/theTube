---
title: The Social Feed
date: 2026-05-14
tags: [tech]
draft: true
summary: Short thoughts that don't need to be posts. A timeline, not a blog index. The feed and the blog are two outputs from the same journal.
---

Not every thought becomes a post. Some are two sentences. Some stay two sentences.

A `/thoughts` page as a social feed — short, datestamped, no pressure to develop. A `thought: true` frontmatter flag separates them from full posts. The index filters for it, renders title + date + summary. No body required.

If a thought develops, it becomes a post. The slug on the thoughts page can even redirect to the full post when that happens — same `redirectFrom` pattern, same alias model. The thought and the post are the same thing at different stages.

The feed and the blog are two different outputs from the same journal. One for developed thinking, one for the running stream. Both dated, both permanent, both owned by the file.

The implementation is light: new frontmatter flag, new page, no new infrastructure. The thoughts that generated the drafts today — markdown as a programming language, package managers, the social package manager idea — those are feed entries. Two sentences each. If they grow, they grow.

Each thought gets a GitHub discussion, same as a full post. The feed entry links to it. Readers comment. The ones that get engagement become posts — `redirectFrom` on the thought's URL, `discussionNumber` carries over. The ones that don't stay as thoughts.

The readers are helping decide what to write next. The discussion is the editorial queue. The engagement is the signal.
