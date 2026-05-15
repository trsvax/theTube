---
title: A Fork Is a Refactor
date: 2026-05-15
tags: [tech]
draft: true
summary: The content and the renderer started in the same repo because that was convenient. When the separation became obvious, the tool for making it was git fork. Same operation as extract class, just at repo scale.
---

The content and the renderer started in the same repo because it was convenient. One push deployed everything. No coordination between repos, no multi-checkout workflows, no token management. It worked.

It was also wrong. Not catastrophically wrong — the site ran fine. But the concern boundary was in the wrong place. The markdown files and the Next.js app had nothing to say to each other beyond "please render me." They didn't need to share a commit history, a branch, or a deploy lifecycle.

The separation became obvious when thinking about forkability. If someone wanted a blog like this one — the Austin Healey restorer, the solo developer with a stack they want to own — they should be able to fork the renderer and get a working blog. Not fork the renderer and get someone else's posts.

## Extract class, repo scale

In code, when a class accumulates responsibilities that belong elsewhere, the move is "extract class." You identify the boundary, move the code, update the callers, run the tests. The class before and the class after are related by lineage, not by code.

A fork is the same operation at repo scale. The content repo is a fork of the app repo at the moment the separation was recognized. The history shows the before — content and renderer coupled. The fork point shows the after — the moment the concern was named.

The fork doesn't hide the history. It records it. The content *did* live with the implementation. That's honest. The commit that strips the renderer out of the content repo and the commit that strips the content out of the renderer repo are the refactor, visible in the log.

## The pipe becomes possible

Before the separation, the renderer and the content were one thing. After, they're two tools with a clear interface: markdown files with YAML frontmatter, in a directory the renderer knows how to read.

That's the Unix pipe. The content repo writes to stdout (markdown files). The renderer reads from stdin (the same files, via a checkout step in Actions). They don't need to know about each other beyond the format agreement.

A third tool — a different renderer, a search indexer, a Bluesky poster — can read from the same content repo without touching the renderer. The interface is public. The content is portable.

## What the fork proves

That the renderer is genuinely separable. If you can separate it from its own content, someone else can point it at their content. The fork of the app repo as a content repo is the proof-of-concept for every future fork.

The Austin Healey restorer forks the renderer. They point it at their own content repo. They never see theTube's posts. The renderer never sees their posts unless they choose to show them. The separation that should have existed from the start now exists — and the path from here to there is a fork and two cleanup commits.

That's a refactor.

[journey]:
prev: doug-mcilroy-would-recognize-it
Written at the moment of doing it — the fork happened in this session, this post was drafted first. The content repo separation was recognized while thinking through what it would take for the renderer to be genuinely forkable by someone else.
