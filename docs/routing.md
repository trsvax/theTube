# Routing

How requests flow through CloudFront → CF Function → Lambda@Edge → S3.

## Request flow

```
Client → CloudFront → CF Function (viewer request) → Lambda@Edge (viewer request) → S3 origin
```

The CF Function runs on every request. Lambda@Edge only runs on paths that need auth. Most requests never hit Lambda.

## CloudFront Function (`cf-short-urls.js`)

Runs on every viewer request. Handles routing, redirects, and the write protocol.

| Pattern | Action | Response |
|---------|--------|----------|
| `/w/*` with query string | Return immediately | 202 Accepted (data in URL, logged) |
| `/blog` | Redirect | 301 → `/journal` |
| `/{shortSlug}` (in SLUGS map) | Redirect | 301 → `/posts/{fullSlug}` |
| `/{role}/*` with no auth cookie | Return immediately | 403 (planned — not yet implemented) |
| `/*` (extensionless) | Rewrite URI | `{path}.html` → pass to origin |
| `/*` (with extension) | Pass through | Forward to origin |

## Lambda@Edge (viewer request — planned)

Only invoked on role-gated paths when the CF Function passes the request through (cookie exists).

| Pattern | Action | Response |
|---------|--------|----------|
| `/user/*` | Validate JWT, check `cognito:groups` | Allow or 403 |
| `/kids/*` | Validate JWT, check `kids` in groups | Allow or 403 |
| `/friends/*` | Validate JWT, check `friends` in groups | Allow or 403 |

JWT validation: parse the `thetube_auth` cookie, verify signature against hardcoded Cognito public keys (no network call), check expiry, check group claim.

## S3 origin

Everything that passes through CF Function + Lambda@Edge hits S3.

| Path | Content |
|------|---------|
| `/public/index.json` | Public post feed |
| `/public/posts/{slug}.html` | Public post pages |
| `/user/index.json` | User-tier feed |
| `/user/posts/{slug}.html` | User-tier post pages (planned) |
| `/kids/index.json` | Kids feed |
| `/friends/index.json` | Friends feed |
| `/index.json` | Root manifest (lists all sections) |
| `/images/*` | Static assets |
| `/fonts/*` | Licensed fonts |

## CloudFront behaviors

| Behavior | Path | Function associations |
|----------|------|----------------------|
| Default | `*` | CF Function (viewer request) |
| Protected | `/user/*`, `/kids/*`, `/friends/*` | CF Function (viewer request) + Lambda@Edge (viewer request) |

## What lives where

| Concern | Layer | Why |
|---------|-------|-----|
| Short URL redirects | CF Function | URL rewrite, no data needed |
| `/w/` write protocol | CF Function | Return 202, data is in the URL |
| `.html` rewriting | CF Function | URI manipulation |
| "No cookie" fast reject | CF Function | Can read cookies, cheap 403 |
| JWT signature validation | Lambda@Edge | Needs crypto (CF Functions can't) |
| Group membership check | Lambda@Edge | Needs to parse JWT claims |
| Serving files | S3 | It's a filesystem |
| Building files | GitHub Actions | Stateless, triggered by push |
