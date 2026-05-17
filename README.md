# theTube

A feature-rich, expandable, serverless publishing system written completely by AI, hosted on AWS, and inspired by Plan 9. Complete overkill for a personal blog — but that's the point. The blog drives the platform.

## The constraint

Static HTML first, everything else optional. No server, no database, no CMS. CSS for presentation, JS for enhancement, auth for gating. Each layer optional — none required for the one below. Works in Lynx. Costs about a dollar a month.

The architecture is the argument. Every decision demonstrates that the web doesn't need to be as complicated as it usually is.

## Journal-driven development

The development methodology: **vague idea → journal → spec → code**, where the last three are a loop.

The journal entry is the unit of work — one file, whole story. The idea, the spec conversation, the implementation log, the dead ends, the finished writing. The file lives in git. Five years later you can open it and reconstruct the what, the why, and the how.

AI is the bridge between prose and implementation. The journal is the input. The spec is the contract. The code is the output — disposable, regenerable. The spec is the source code. The code is the object code.

## The contract

Any content source that wants to participate produces two things: static HTML synced to an S3 path, and a `content.json` manifest. That's the interface. The front end doesn't care what built it.

## Links

- Live site: [thetube.today](https://thetube.today)
- Platform spec: `.kiro/specs/platform/requirements.md`
- Journal spec: `.kiro/specs/journal-to-spec/requirements.md`
- Journal skill: `skills/journal/SKILL.md`
