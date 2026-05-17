# Platform Principles

The contract is: files at URLs. Nothing cares what built them or what reads them.

## When suggesting solutions

- Default to files on S3 served via CloudFront
- Default to Lambda for processing, not servers
- Default to CloudFront logs for event capture
- Don't suggest databases unless the problem genuinely requires transactions
- Don't suggest servers unless the problem genuinely requires persistent connections
- Don't suggest infrastructure that costs money when idle

## The four concepts

1. **Files** — the data, the content, the logs, the records
2. **URLs** — the address of every file, the interface between all components
3. **Functions** — Lambda, triggered by events, stateless, ephemeral
4. **CDN** — serves files, handles auth, ingests events, scales globally

If a solution doesn't fit these four, question whether the problem is being framed correctly before adding complexity.

## Cost constraint

A dollar a month at personal scale. Linear cost at any scale. If a suggestion adds fixed monthly cost, flag it.

Scale and fault tolerance are baked in — CloudFront is globally distributed, S3 is eleven 9s durable, Lambda scales to thousands of concurrent invocations. Don't add infrastructure for scale or reliability. It's already there.

## When all else fails

Plan 9. Everything is a file. The namespace is composable. The protocol is universal. If the solution feels complicated, ask: how would Plan 9 do this?
