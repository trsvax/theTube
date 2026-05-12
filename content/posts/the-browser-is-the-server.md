---
title: The Browser Is the Server
date: 2026-05-11
tags: [tech]
audience: user
summary: Role-based content, no server, no SaaS auth. What the architecture looks like and how I got there.
---

Everyone assumes you need a server the moment roles enter the picture. A database for sessions. An API to check permissions. A SaaS auth product. A bill that grows with traffic.

You don't.

## The model

The standard advice for "I want some content to be members-only": Next.js with server-side rendering, a session store, middleware that checks the session, an auth provider bolted on top. Three moving parts before you've written a word of content.

Here's a different model: the browser fetches what it's allowed to fetch, ignores what it's not, and assembles the page from whatever comes back.

The content lives in separate JSON index files — one per role. The CDN enforces access at the edge. A JWT in a cookie carries the user's identity and group membership. A 2ms edge function checks the token on protected paths and either passes the request through or returns a 403.

The browser reads a JS-readable cookie that lists the user's roles, fetches only the feeds it's entitled to, and assembles the page from whatever comes back. Not logged in — only public content loads. Logged in with two roles — two feeds plus public. A 403 is never expected and never needed.

No server. No session store. No database. No per-request compute for the 95% of visitors who never log in.

## What didn't work

The first approach used CloudFront signed cookies — one set per role. The browser deduplicates cookies by name. Three roles, same cookie names, same domain: only the last `Set-Cookie` header survives. The whole per-role isolation collapsed.

Subdomains would have fixed the name collision, but `auth.thetube.today` can only set cookies for `.thetube.today`, not for individual subdomains. Same problem, different layer.

The JWT approach eliminates it. One cookie, full identity, group membership in the claim. The edge function reads it and decides. No signing keys to rotate, no Secrets Manager dependency, no cookie arithmetic.

Adding a new role is a Cognito group, a CloudFront path, and a line of code. The number of roles is not a meaningful constraint.

## The constraint is the point

"Static only, no server" sounds like a limitation. It's actually what forces the clean design. If you can't run server-side code on every request, you have to think differently about where state lives and how permissions work. The answer turns out to be: in the token, enforced at the edge, assembled by the browser.

Less code. More function.

## It's still the web

The output is real HTML on real URLs. Bookmarks work. The back button works. Links are links. Search engines can index it. Screen readers can read it. The browser's built-in find, bookmarks, history, and reading mode all work — because nothing is overriding them.

Single-page apps spend enormous effort recreating this — client-side routers, scroll restoration, meta tag injection — to approximate what you'd have gotten for free if you'd served HTML.

Pages linked to pages. The server sent documents. The browser rendered them. Most of what the web does — reading, publishing, sharing — never needed more than that. The tooling pushed everyone toward the app model anyway, and now you need a build pipeline and a runtime and a deployment platform to publish text.

This site has real authentication and role-based content and it's still just files. That used to be the default.

It also works in Lynx. Public posts render as static HTML at build time — no JS required. Add JS and you get tag filtering and role-based content on top. Add auth and you get members-only posts. Each layer degrades cleanly to the one below. That's not a feature that was added. It's what you get when you don't fight the web.

## The cost

At 1 million requests a month, this architecture costs about $1. S3 and CloudFront pricing. The edge function only runs on protected paths — public content has zero auth overhead, same as any static site.

Compare that to a typical Next.js setup on Vercel with an auth SaaS: $20 base, $25 for auth, $10-50 for a database. $55-100/month before you have any real traffic.

At 10 million requests, this stays under $10. Vercel at that scale is an enterprise pricing conversation.

Could it survive Slashdot? Yes — better than most. Public content is S3 behind CloudFront with no compute in the path. There's nothing to overwhelm. A Vercel/Next.js/database stack under the same spike would be an incident.

Phase 1: remove the server. Phase 2: ???. Phase 3: survive Slashdot.

## The happy accident

The right architecture came from following dead ends. A script can only execute what you already know. A conversation can find what you don't.

That's a different kind of tool.
