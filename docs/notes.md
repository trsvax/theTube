# Git Notes Convention

Git notes are the session journal. They record what happened, what was decided, and what's next — attached to commits, not in commit messages.

## Where

All notes live on `trsvax/theTube`, ref `refs/notes/commits` (the default). One note per session, attached to the session's last commit on theTube.

Even if a session only touches other repos (theTube-content, thetube-private, theTube-comments, tapestry-nocode, etc.), the note goes on theTube. Attach it to whatever the current HEAD of theTube is at session end. This keeps the full journal in one place.

## When to write

Write a note when a session produces meaningful work: design decisions, content published, architecture changes, multi-step implementations. Don't note trivial single-commit fixes.

## Format

Single paragraph. No line breaks. Dense but readable.

```
Session: <topic>. <what was done>. <key decisions>. <what's next>.
```

For content work, use `Post:` prefix instead:

```
Post: <slug>. <what the post covers>. <related changes>.
```

## Structure within the paragraph

1. **Label** — `Session:` or `Post:` followed by the topic
2. **What was done** — concrete deliverables, files created/changed
3. **Key decisions** — the *why*, not just the *what*
4. **Next** — what's unfinished or queued (optional, omit if session is self-contained)

## Examples

```
Session: comment system design. Designed the full comment architecture — /w/comment/open for tokens, /w/comment/add for writes, processor Lambda from logs, index.json as readdir(). Key decisions: request IDs as filenames (no coordination), open() as privilege escalation (trust levels in token), ? as security boundary (batch vs realtime), single writer via log processing. Next: wire infrastructure (CloudFront Function, deploy Lambda, WAF rule).
```

```
Post: dont-give-your-team-your-passwords. Trust model for AI-assisted dev — don't give AI database access, architecture is the trust boundary, the stranger heuristic. Also fixed README in theTube-comments to match current design.
```

## How to write

```bash
git notes add -m "Session: ..."
```

To append to an existing note (e.g., session continued after a break):

```bash
git notes append -m "Session continued: ..."
```

## How to push

Notes don't push with `git push`. Push them explicitly:

```bash
git push origin 'refs/notes/*:refs/notes/*'
```

Or for just the default ref:

```bash
git push origin refs/notes/commits
```

## How to read

Last 10 sessions:

```bash
git log --show-notes --notes -10 --format="%h %s%n%N"
```

## Rules

- One note per session, on the last commit
- Never overwrite another agent's note — use `append` if adding to an existing note
- Keep it under 500 characters when possible
- No markdown formatting, no bullet points — plain text, single paragraph
- Include decisions and reasoning, not just actions
- If a session spans multiple repos, still write one note on theTube — mention which repos were touched
- The note is for the *next* reader (human or AI) — include enough context to resume work without reading the full diff
