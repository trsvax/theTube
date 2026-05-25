# Share System — Requirements

## What this is

An Apple Share action that captures intent from any app and routes it to theTube. Two trust tiers: field capture (log-only, no compute) and publish (Lambda, verified upload). The `[share]:` block in a post is the glue between the capture event and the rendered output.

---

## The problem

You're out walking. You see something worth writing about. You take a photo. By the time you're back at the machine the moment is gone. You remember the photo. You don't remember why it mattered.

---

## Design principles

- Field capture is free — data in the query string, logged by CloudFront, 202. No Lambda, no upload, no cost.
- Publish earns compute — binary upload to Lambda, verified by signature, stored to S3.
- The `?` decides where data lands — URL (CF logs) or body (Lambda saves). JWT gates access to either path.
- The `[share]:` block follows the `[design]:` pattern — placeholder until `src:` is populated, real asset once it lands.
- The photo stays in iCloud until you decide to publish it. The log is the breadcrumb.

---

## Requirements

### REQ-1: Field capture via query string

A POST to `/tube/share/add?type={type}&file={filename}&date={date}&caption={caption}` is logged by CloudFront and returns 202. No compute required. The query string is the data.

The CF function already handles this — any `/tube/*` request with a query string returns 202.

### REQ-2: `[share]:` block renderer

The `[share]:` block in a post renders as:
- An `<img>` tag when `src:` is present (same as `[design]:`)
- Nothing (stripped) when `src:` is absent — it's a placeholder waiting for the asset

Block format:
```markdown
[share]:
type: image
file: IMG_1234.HEIC
captured: 2026-05-23
caption: temple gate at sunset
src: /shares/K1jaBcDeFgH.jpg
```

Fields:
- `type` — media type (image, video, link, note)
- `file` — original filename from the device
- `captured` — date of field capture
- `caption` — what you wrote at capture time
- `src` — S3 path to the published asset (empty until publish)

### REQ-3: CSS placeholder (stretch goal)

When `src:` is absent but the block exists, optionally render a styled placeholder showing the caption and capture date. This is lower priority than REQ-2 — stripping the block entirely is acceptable for v1.

### REQ-4: iOS Shortcut for field capture

An Apple Shortcut named "Save to Tube" that:
1. Accepts share input (image, URL, text)
2. Extracts: type, filename, current date, user-provided caption (optional prompt)
3. POSTs to `https://thetube.today/tube/share/add?type={type}&file={file}&date={date}&caption={caption}`
4. Includes `Authorization: Bearer {token}` from Keychain
5. Shows a brief confirmation

The Shortcut is the prototype. It works today with the existing CF function.

### REQ-5: Auth for field capture

A long-lived JWT stored in the iOS Keychain. The token is sent as `Authorization: Bearer <token>`. The log processor (future) validates it before acting on the log entry. The CF function doesn't validate — it logs and returns 202 regardless. Auth is checked at processing time, not capture time.

### REQ-6: Publish via Lambda (Phase 2)

A POST to `/tube/share/upload` (no query string) with:
- Binary body (the image/file)
- `Content-Type` header
- `X-Share-Meta: type={type}&file={file}&date={date}` header
- Signature header (openssl-signed, public key in repo)

Lambda verifies the signature, stores the file to `s3://bucket/shares/{requestId}.{ext}`, returns the S3 path. The user (or agent) updates the `[share]:` block's `src:` field.

### REQ-7: Namespace isolation

The share system owns:
- Path: `/tube/share/*`
- S3 prefix: `/shares/`
- Lambda: share processor (Phase 2)
- IAM: write only to `s3://bucket/shares/*`

Same isolation model as comments.

---

## Phases

| Phase | What | Depends on |
|-------|------|-----------|
| 1 | `[share]:` block renderer + CSS + iOS Shortcut (field capture only) | Nothing — CF function already handles `/tube/*?*` |
| 2 | Mac publish script (openssl signing) + Lambda for `/tube/share/upload` + S3 storage | Phase 1 |
| 3 | Native iOS/macOS SwiftUI app, Secure Enclave, replaces Shortcuts | Phase 2 |

---

## What's NOT in scope

- Log processing (reading CloudFront logs to auto-create `[share]:` blocks) — that's a separate spec
- Video transcoding — store as-is for now
- Multi-file shares — one file per block for now
- The native app (Phase 3) — that's a future spec

---

## Relationship to existing systems

- **`/tube/` protocol** — share uses the same `?`-routing convention. No new infrastructure for Phase 1.
- **`[design]:` block** — share follows the same render pattern (placeholder → real asset).
- **Comment system** — same namespace isolation model, same log-based processing model.
- **CloudFront Function** — already handles the 202 response. No changes needed.
