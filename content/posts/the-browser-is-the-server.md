---
title: The Browser Is the Server
date: 2026-05-11
tags: [tech]
audience: user
summary: Role-based content, no server, no SaaS auth. What the architecture looks like and how I got there.
---

Everyone assumes you need a server the moment roles enter the picture. A database for sessions. An API to check permissions. A SaaS auth product. A bill that grows with traffic.

You don't.

## The assumption

The standard advice for "I want some content to be members-only" goes something like: Next.js with server-side rendering, a session store, middleware that checks the session, and an auth provider bolted on top. You're looking at three moving parts before you've written a word of content.

The assumption underneath all of it is that the server decides what you see. The request comes in, the server checks who you are, the server sends back the right content.

That assumption is wrong.

## The browser is the server

Here's a different model: the browser fetches what it's allowed to fetch, ignores what it's not, and assembles the page from whatever comes back.

The content lives in separate JSON index files — one per role. The CDN enforces access at the edge. A JWT in a cookie carries the user's identity and group membership. A 2ms edge function checks the token on protected paths and either passes the request through or returns a 403.

The browser tries all four feeds — public, user, kids, friends. It gets back whatever it's entitled to. 403s are silently dropped. The page renders from the union of what arrived.

No server. No session store. No database. No per-request compute for the 95% of visitors who never log in.

## The cost

At 1 million requests a month, this architecture costs about $1. S3 and CloudFront pricing. The edge function only runs on protected paths — public content has zero auth overhead, same as any static site.

Compare that to a typical Next.js setup on Vercel with an auth SaaS: $20 base, $25 for auth, $10-50 for a database. $55-100/month before you have any real traffic.

At 10 million requests, this stays under $10. Vercel at that scale is an enterprise pricing conversation.

## The constraint is the point

"Static only, no server" sounds like a limitation. It's actually what forces the clean design. If you can't run server-side code on every request, you have to think differently about where state lives and how permissions work. The answer turns out to be: in the token, enforced at the edge, assembled by the browser.

## What didn't work

The first approach used CloudFront signed cookies — one set per role. The browser deduplicates cookies by name. Three roles, same cookie names, same domain: only the last `Set-Cookie` header survives. The whole per-role isolation collapsed.

Subdomains would have fixed the name collision, but `auth.thetube.today` can only set cookies for `.thetube.today`, not for individual subdomains. Same problem, different layer.

The JWT approach eliminates it. One cookie, full identity, group membership in the claim. The edge function reads it and decides. No signing keys to rotate, no Secrets Manager dependency, no cookie arithmetic.

## The happy accident

The right architecture came from following dead ends. A script can only execute what you already know. A conversation can find what you don't.

That's a different kind of tool.
