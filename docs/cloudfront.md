# CloudFront Distribution

Distribution `E2DMNPNLN0VAQM` — serves `thetube.today`.

---

## Behaviors

Evaluated in order. First match wins.

| # | Path | Methods | Function | Purpose |
|---|------|---------|----------|---------|
| 0 | `/tube/share/*` | ALL (POST, PUT, DELETE, etc.) | `thetube-share` (CF Function) | Share endpoint — log captures, accept uploads |
| 1 | `/user/*` | GET, HEAD | `thetube-edge-auth` (Lambda@Edge) | Role-gated content — Cognito JWT required |
| 2 | `/kids/*` | GET, HEAD | `thetube-edge-auth` (Lambda@Edge) | Role-gated content — `kids` group required |
| 3 | `/friends/*` | GET, HEAD | `thetube-edge-auth` (Lambda@Edge) | Role-gated content — `friends` group required |
| — | `*` (default) | GET, HEAD | `thetube-router` (CF Function) | Everything else — routing, redirects, .html rewrite |

---

## Functions

| Name | Type | Attached to | What it does |
|------|------|-------------|--------------|
| `thetube-router` | CF Function | Default behavior | `/tube/*?*` → 202 Noted; `/a/{alias}` → redirect; `/blog` → `/journal`; extensionless → `.html` |
| `thetube-share` | CF Function | `/tube/share/*` | Share-specific routing (same as router today, will diverge for body/compute path) |
| `thetube-edge-auth` | Lambda@Edge | `/user/*`, `/kids/*`, `/friends/*` | Validates Cognito JWT from `thetube_auth` cookie, checks group claims |

### Unattached (legacy)

| Name | Notes |
|------|-------|
| `short-url-redirects` | Old name for `thetube-router`. Same code. Can delete. |
| `thetube-rewrite` | Predecessor. Can delete. |

---

## Origin

Single origin: S3 bucket `thetube-today` via OAI.

---

## Logging

- **Enabled**: yes
- **Bucket**: `thetube-today-logs`
- **Prefix**: `cf/`
- **Cookies**: included

Logs are the event bus. Every request — including `/tube/*` writes — lands here. The MCP server reads them via `sync_captures`.

---

## General

| Setting | Value |
|---------|-------|
| HTTP version | HTTP/2 + HTTP/3 |
| IPv6 | enabled |
| Price class | PriceClass_100 (US, Canada, Europe) |
| SSL | SNI, ACM cert |
| Default root | `index.html` |

---

_Last updated: 2026-05-25_
