---
title: CloudFront Is a Reverse Proxy
date: 2026-05-12
tags: [tech]
audience: user
summary: Map /admin to a server, /api to Lambda, /auth to Cognito — all on one domain, no nginx required.
---

A static site has one problem: it can't run code. The standard fix is "add a server." But the server doesn't have to be behind the whole site — it just has to be behind the paths that need it.

CloudFront behaviors are path rules. `/posts/*` → S3. Done. But the same distribution can have `/admin*` → an EC2 instance, `/api/*` → API Gateway, `/auth/*` → the existing auth Lambda. Each path routes to a different origin. The browser sees one domain.

```
thetube.today/          → S3 (static)
thetube.today/auth/*    → Lambda (Cognito callback)
thetube.today/api/*     → API Gateway
thetube.today/admin*    → EC2 or whatever
```

The static site doesn't know about `/admin`. The admin panel doesn't know about S3. They share a domain and nothing else.

## Why this matters

The alternative is running nginx as a reverse proxy in front of everything. That's a server to maintain, patch, and keep running. CloudFront is managed infrastructure — no instances, no uptime responsibility, global edge network included.

And because CloudFront sits in front, you get TLS termination, caching headers, WAF rules, and access logs on all of it — static and dynamic — from one place.

## The escape hatch

Start fully static. When something needs a server, add a behavior. The rest of the site doesn't change. You get the simplicity of static files right up until the moment you need something more, and then you add exactly that — nothing else.

It's not a static site with a server bolted on. It's a unified domain with the right backend behind each path.
