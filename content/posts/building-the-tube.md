---
title: Building theTube
date: 2026-05-11
tags: [tech]
audience: public
summary: How I built this blog — static site, real auth, role-based content, no server.
---

A personal blog that does more than it looks like it should be able to. Public posts anyone can read. Members-only posts behind real authentication. Friends and family see content nobody else does. And there's no server — it's all static files on S3 with a CDN in front.

Here's how it works.

## The goal

I wanted a site that felt dynamic — different content for different people — but was built entirely from static assets. No database, no server to maintain, no CMS to log into, no bill that grows with traffic.

The constraint: **permissions enforced at the CDN layer, content gated by role, browser does the rest.**

## The stack

Four runtime dependencies:

- `next` — the framework
- `react` + `react-dom` — obvious
- `marked` — markdown to HTML at build time

Posts are plain markdown files with YAML frontmatter. The whole thing builds to static HTML and ships to S3 + CloudFront via GitHub Actions.

What I didn't use: no Tailwind, no MDX, no CMS, no `next/image`, no dark mode toggle (CSS `prefers-color-scheme` handles it).

## The brand

The site has a real brand, done by a graphic designer. The palette:

- **Warm Midnight** `#2A0002` — dark maroon for text and headings
- **Sunshine** `#F18636` — orange for accents and hover states
- **Open Sky** `#455978` — navy for links and nav
- **Enamel** `#F1E1D5` — the warm cream background

The typeface is **Swear Display** by Oh No Type Company — Black for headlines, Cilati italic for emphasis. Fonts are web-licensed and kept out of the public git repo.

## The content model

Every post has an `audience` field in its frontmatter:

```yaml
---
title: Something I wrote
date: 2026-05-11
tags: [travel]
audience: friends
---
```

Four audiences: `public`, `user`, `kids`, `friends`. At build time, a Node script reads all posts, groups them by audience, and writes four separate JSON index files — one per role — into the `out/` directory. CloudFront serves each from a path-based behavior: `/public/content.json`, `/user/content.json`, etc.

The browser fetches all four and merges whatever it can get. If a request 403s — because you're not logged in or not in the right group — it's silently skipped. No error, just fewer posts.

## The auth system

This is where it gets interesting.

### Cognito

Authentication is handled by Amazon Cognito. Users can sign in with Google or with an email and password. I create email/password accounts manually for family members — Cognito emails them a temporary password, they set their own on first login.

Groups in Cognito map to roles: `kids`, `friends`. Being authenticated at all gives you the `user` role.

### The callback Lambda

After Cognito authenticates a user, it redirects to a Lambda function at `auth.thetube.today/callback`. The Lambda exchanges the authorization code for tokens, then sets two cookies:

- `thetube_token` — the Cognito id token, HttpOnly, 24-hour expiry
- `thetube_user` — the user's email, JS-readable, used to show the logout button

That's it. No CloudFront signed cookies, no key pairs, no Secrets Manager. Just a JWT.

### Lambda@Edge

Here's the actual enforcement. A Lambda@Edge function runs on every viewer request to `/user/*`, `/kids/*`, and `/friends/*`. It:

1. Reads the `thetube_token` cookie
2. Validates the RS256 signature against the Cognito public keys (hardcoded from the JWKS endpoint)
3. Checks that the token hasn't expired
4. Checks the `cognito:groups` claim against the requested path
5. Returns 403 if anything fails, or passes the request through to S3 if it passes

The Cognito public keys are hardcoded in the function — no network call at edge time. Cognito rarely rotates them, and every content push redeploys the function anyway.

`/public/*` is always allowed. No function runs on those paths.

## The infrastructure

Everything is defined in CDK — Cognito user pool, Lambda functions, API Gateway, Route 53, ACM certs. The main CloudFront distribution was set up manually before CDK was in the picture, so it lives outside the stack, but the auth pieces are all managed.

Two repos: `trsvax/theTube` (public — app code, public posts) and `trsvax/theTube-private` (private — protected content, licensed fonts, CDK stack, Lambda source). The deploy workflow checks out both, merges the private assets in, then builds.

## The build

GitHub Actions on every push to `main`:

1. Checkout both repos
2. Pull fonts from private repo into `public/fonts/`
3. `npm ci && npm run build` — Next.js export + content index generation → `out/`
4. `aws s3 sync out/ s3://thetube-today --delete`
5. CloudFront invalidation

Total build time: about 30 seconds. The auth Lambda and edge function are deployed separately via CDK when the infrastructure changes — content pushes don't touch them.

## What didn't work

The first auth approach used CloudFront signed cookies — one set of `CloudFront-Policy`, `CloudFront-Signature`, and `CloudFront-Key-Pair-Id` cookies per role. The problem: the browser deduplicates cookies by name. Three roles, same cookie names, same domain — only the last `Set-Cookie` header survives. The whole per-role isolation collapsed to whichever role was issued last.

The subdomain approach (separate CloudFront distributions for `user.thetube.today`, `kids.thetube.today`, `friends.thetube.today`) would have worked around the name collision, but `auth.thetube.today` can only set cookies for `.thetube.today`, not for individual subdomains — same problem, different layer.

The JWT-at-the-edge approach eliminates the problem entirely. One cookie carries the full identity including group membership. The edge function reads it and decides what to allow. Clean.
