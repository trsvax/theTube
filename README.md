# theTube

A feature-rich, expandable, serverless publishing system written completely by AI, hosted on AWS, and inspired by Plan 9. Complete overkill for a personal blog — but that's the point. The blog drives the platform.

## The constraint

No server. No database. Everything is a file and a URL. The CDN is the platform — it serves content, handles auth, ingests events, and scales globally. What looks like a static site supports user input, real-time writes, and role-based access. Works in Lynx. Costs about a dollar a month.

## Journal-driven development

The development methodology: **vague idea → journal → spec → code**, where the last three are a loop.

The journal entry is the unit of work — one file, whole story. The idea, the spec conversation, the implementation log, the dead ends, the finished writing. The file lives in git. Five years later you can open it and reconstruct the what, the why, and the how.

AI is the bridge between prose and implementation. The journal is the input. The spec is the contract. The code is the output — disposable, regenerable. The spec is the source code. The code is the object code.

## The contract

Files at URLs. That's the interface. Nothing cares what built them or what reads them.

For the post feed, the contract is `content.json` — a manifest of items at a known path. For comments, it's a text file at `comments/<post>.txt`. For logs, it's a request to `/logs/...`. Each use case has its own convention, but the underlying contract is always the same: a file at a URL.

## Use this methodology

The specs and skills in this repo are files at URLs. Point any AI at them and say "use that workflow." No fork needed. No installation. Just a reference.

- Want journal-driven development? Read `.kiro/specs/journal-to-spec/requirements.md`
- Want the platform architecture? Read `.kiro/specs/platform/requirements.md`
- Want the design principles? Read `.kiro/steering/platform.md`

Methodologies, architectures, coding standards — all files that AI reads and applies. The barrier to adopting a workflow drops to zero. The methodology is the product.

## Links

- Live site: [thetube.today](https://thetube.today)
- Platform spec: `.kiro/specs/platform/requirements.md`
- Journal spec: `.kiro/specs/journal-to-spec/requirements.md`
- Journal skill: `skills/journal/SKILL.md`
