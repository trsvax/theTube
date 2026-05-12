---
title: GitHub Issues as a Comment System
date: 2026-05-12
tags: [tech]
audience: user
summary: Static sites can't have comments. GitHub Issues can. Here's how to wire them together without giving up editorial control.
---

Static sites don't have comments. That's usually listed as a limitation. I've started thinking of it as a clarifying constraint.

The options people reach for: Disqus (surveillance capitalism, slow, ugly), a managed comment SaaS (another subscription, another login, another thing to break), or just... no comments. Most personal blogs end up at no comments. I was heading there too until I noticed I was already using GitHub Issues to track feedback on the site itself.

The code lives on GitHub. The readers who'd bother to comment are the same people who already have GitHub accounts. The issues are public by default. I don't need to build anything.

## The model

Fetch open issues at build time. Bake them into the HTML. No JavaScript needed to read them.

```ts
const res = await fetch(
  "https://api.github.com/repos/trsvax/theTube/issues?labels=published&state=open"
);
const issues = await res.json();
```

The `published` label is the editorial gate. I read everything that comes in. I label the ones I want on the site. Spam stays closed. Good-faith disagreement gets published. Anyone who wants to see the unfiltered list can look at GitHub directly — the link is right there. Nobody can accuse me of hiding anything.

## Labels do the work

GitHub labels are more useful here than they first appear.

`published` controls what hits the site. `post:browser-is-the-server` routes a discussion to a specific post page — the build step reads that label and drops the issue into the right place. Topic labels (`tech`, `travel`) match the existing tag taxonomy, so filtering works consistently across posts and discussions.

A `correction` label is its own display category. If someone catches a factual error, I want that visible and distinct from general commentary.

## Types and milestones

GitHub recently added issue types — Bug, Feature, Task, Question. For a comment system, Question is the default. But a `correction` can be typed as Bug and rendered with a visible marker. It's a small signal that earns some trust.

Milestones can group discussions into series. If I write three posts about a trip, one milestone ties the conversations together. That's probably future scope — right now I don't have enough volume to need it.

## Relationships

Sub-issues are interesting. One canonical issue per post as the discussion anchor; individual threads as sub-issues. The parent URL becomes the permalink for that post's discussion — stable, linkable, not dependent on any infrastructure I maintain.

I probably won't use this until someone actually wants to have a threaded conversation. Design for the volume you have.

## A publish workflow for free

The same label system works for tracking posts, not just discussions. A GitHub Action triggers on every push to `content/posts/`. It reads the frontmatter, creates an issue if one doesn't exist, and syncs the labels — `post-draft` when audience is `user`, `post-published` when it goes public.

The lifecycle:

1. Create the post with `audience: user` → push → issue created, labeled `post-draft`
2. Edit and push drafts — issue stays open
3. Change `audience: public` → push → issue relabeled `post-published`, post goes live

Close the issue when it's done. The issue history is the publishing record.

That's already useful. But there's one more step. A workflow on the `issues: closed` event reads the `post:slug` label, updates the frontmatter in the file to `audience: public`, commits, and pushes. The deploy workflow fires. Closing the issue publishes the post.

It's a stretch goal, but the pieces are all there.

## What I'm not building

No real-time. No notifications. No reply threading in the UI. If someone wants to respond to a specific comment, they do it on GitHub, where this kind of interaction already has good tooling.

The nightly build picks up new published issues automatically. For a personal blog, fresh-enough is good enough.

## The actual implementation

It's a fetch call in a server component and a loop over the results. I'll write the code when I'm ready to ship it. The decision is made; the code is easy.

What I won't do is use a Disqus embed that phones home on every page load, sets third-party cookies, and makes my site feel like a different site. The comment section isn't worth that.
