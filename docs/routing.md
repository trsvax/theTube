# Routing

How requests flow through CloudFront → CF Function → Lambda@Edge → S3.

## Request flow

```
Client → CloudFront → CF Function (viewer request) → Lambda@Edge (viewer request) → S3 origin
```

The CF Function runs on every request. Lambda@Edge only runs on paths that need auth. Most requests never hit Lambda.

## CloudFront Function (`cf-short-urls.js`)

Runs on every viewer request. Handles routing, redirects, and the write protocol.

| Pattern                         | Action             | Response                            |
| ------------------------------- | ------------------ | ----------------------------------- |
| `/tube/*` with query string     | Return immediately | 202 Accepted (data in URL, logged)  |
| `/blog`                         | Redirect           | 301 → `/journal`                    |
| `/{shortSlug}` (in SLUGS map)   | Redirect           | 301 → `/posts/{fullSlug}`           |
| `/{role}/*` with no auth cookie | Return immediately | 403 (planned — not yet implemented) |
| `/*` (extensionless)            | Rewrite URI        | `{path}.html` → pass to origin      |
| `/*` (with extension)           | Pass through       | Forward to origin                   |

## Lambda@Edge (viewer request — planned)

Only invoked on role-gated paths when the CF Function passes the request through (cookie exists).

| Pattern      | Action                                  | Response     |
| ------------ | --------------------------------------- | ------------ |
| `/user/*`    | Validate JWT, check `cognito:groups`    | Allow or 403 |
| `/kids/*`    | Validate JWT, check `kids` in groups    | Allow or 403 |
| `/friends/*` | Validate JWT, check `friends` in groups | Allow or 403 |

JWT validation: parse the `thetube_auth` cookie, verify signature against hardcoded Cognito public keys (no network call), check expiry, check group claim.

## S3 origin

Everything that passes through CF Function + Lambda@Edge hits S3.

| Path                        | Content                            |
| --------------------------- | ---------------------------------- |
| `/public/index.json`        | Public post feed                   |
| `/public/posts/{slug}.html` | Public post pages                  |
| `/user/index.json`          | User-tier feed                     |
| `/user/posts/{slug}.html`   | User-tier post pages (planned)     |
| `/kids/index.json`          | Kids feed                          |
| `/friends/index.json`       | Friends feed                       |
| `/index.json`               | Root manifest (lists all sections) |
| `/images/*`                 | Static assets                      |
| `/fonts/*`                  | Licensed fonts                     |

## CloudFront behaviors

| Behavior  | Path                               | Function associations                                              |
| --------- | ---------------------------------- | ------------------------------------------------------------------ |
| Default   | `*`                                | `cf-short-urls.js` (viewer request)                                |
| Share     | `/tube/share/*`                    | `cf-share.js` (viewer request)                                     |
| Protected | `/user/*`, `/kids/*`, `/friends/*` | `cf-short-urls.js` (viewer request) + Lambda@Edge (viewer request) |

## Write endpoint (`/tube/`) routing model

`/tube/` is the app mount point. Each app owns its namespace under `/tube/` and its own routing decisions.

### The pattern

Every app gets a CF function. The function decides what happens at the edge:

- Query string → 202 (data is in the URL, CloudFront logs it, no compute)
- No query string → pass through to Lambda (body needs processing)

This is the default behavior. An app can override it — route a `?` request to compute, validate params before accepting, return different headers. The app owns the decision.

### Why per-app

CF Functions can't read request bodies. So body = Lambda (technical constraint, not a design choice). But query-string requests _could_ also need compute. The per-app function controls that decision without polluting a shared function with app-specific logic.

### The default

`cf-short-urls.js` still catches `/tube/*?*` → 202 as a fallback for any path that doesn't have its own behavior. Apps that haven't claimed their namespace yet get log-and-202 for free.

### Current apps

| App       | Path               | Function      | Status                              |
| --------- | ------------------ | ------------- | ----------------------------------- |
| Share     | `/tube/share/*`    | `cf-share.js` | Same as default today, will diverge |
| Comments  | `/tube/comments/*` | —             | On the default for now              |
| Reactions | `/tube/react/*`    | —             | On the default for now              |

Apps graduate from the default by getting their own CloudFront behavior + CF function. Share is first because it has both capture (log-only) and publish (compute).

## What lives where

| Concern                                | Layer                 | Why                                  |
| -------------------------------------- | --------------------- | ------------------------------------ |
| Short URL redirects                    | CF Function           | URL rewrite, no data needed          |
| `/tube/` default (log only)            | CF Function           | Return 202, data is in the URL       |
| `/tube/share/` routing                 | CF Function (per-app) | Share has both log and compute paths |
| `.html` rewriting                      | CF Function           | URI manipulation                     |
| "No cookie" fast reject                | CF Function           | Can read cookies, cheap 403          |
| JWT signature validation               | Lambda@Edge           | Needs crypto (CF Functions can't)    |
| Group membership check                 | Lambda@Edge           | Needs to parse JWT claims            |
| Body processing (`/tube/share/upload`) | Lambda                | CF Functions can't read bodies       |
| Serving files                          | S3                    | It's a filesystem                    |
| Building files                         | GitHub Actions        | Stateless, triggered by push         |
