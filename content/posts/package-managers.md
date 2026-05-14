---
title: I Don't Want to Be Friends With npm
date: 2026-05-14
tags: [tech]
draft: true
summary: npm's trust model is broken. You're one transitive dependency away from trusting everyone who has ever published a package.
issueNumber: 37
discussionNumber: 39
---

The trust model is completely broken.

When you `npm install` something, you're trusting every person who has ever published any transitive dependency of anything you install. There's no mechanism to express that you trust some authors and not others. You get `node_modules` with 800 packages from 600 strangers and you're just hoping none of them went rogue or got their account compromised.

The existing signals — download count, GitHub stars — are gameable and say nothing about the author's intentions. `left-pad` had all those signals and still took down half the internet when one guy rage-quit.

## The social package manager that doesn't exist

What if the trust graph followed actual relationships? You trust packages your coworkers use. They trust packages their trusted contacts use. Reputation propagates through a network you actually know, not through download counts and anonymous star ratings.

GitHub already has the graph — orgs, teams, followers. It's just not wired to anything that matters for package resolution.

## Maven Central got this right, sort of

Maven Central has a more curated trust model than npm — that's partly why Java enterprise shops tolerated the `pom.xml` tax. They were buying something: a registry that wasn't a free-for-all.

I tried to solve this in 2013. I built [tapestry-modules](https://github.com/tapestry-modules) — an org that pulled documentation data from GitHub and POM files to make the Tapestry module ecosystem legible. Who published what, what it depended on, whether it was still maintained. The discovery and trust problem, just in a different ecosystem.

It's still live. Last commit 2013.

I also built a lot of the modules it was trying to catalog. You feel the weight of it — the dependencies, the version pinning, the moment an author abandons their package and you're the one holding the bug. I was that author. Now theTube runs on 4 runtime deps by design.

That's not minimalism as religion. It's knowing what the other end looks like.

[journey]:
prev: markdown-is-a-programming-language
The Maven/XML discussion led here. Maven Central has a more curated trust model than npm — that's why the pom.xml tax was tolerated. tapestry-modules was a 2013 attempt at the same thing for a different ecosystem: aggregate metadata from GitHub and POM files, make the dependency graph legible. Still live, last commit 2013.
