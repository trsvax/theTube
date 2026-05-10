# Verify Skill

Domain knowledge for verifying and recording test results on commits in theTube.

## Workflow

After each deploy or significant commit:

1. Identify what changed
2. Fetch the live site to confirm behavior (use `fetch_webpage` tool)
3. Attach a git note to the commit listing what was verified and any failures

## Attaching a verification note

```bash
git notes add -m "Verify:
- <check 1>
- <check 2>"
```

To amend a note on HEAD:
```bash
git notes append -m "- <additional check>"
```

To view notes:
```bash
git log --show-notes -1        # latest commit
git log --show-notes           # all recent commits
git notes show <commit-hash>   # specific commit
```

## Pushing notes to remote

Notes don't push automatically:
```bash
git push origin refs/notes/*
git fetch origin refs/notes/*:refs/notes/*
```

## What to verify per phase

### Phase 1 — Public site
- Homepage loads at https://thetube.today
- /blog loads and shows posts
- /posts/[slug] renders post content
- /about and /contact load without errors
- HTTPS redirect works (http → https)

### Phase 2 — Index files
- /public/content.json returns correct items array
- /user/content.json, /kids/content.json, /friends/content.json return empty arrays
- PostList on /blog fetches and renders posts from /public/content.json
- Tag filter works client-side

### Phase 3 — Auth (future)
- Login redirects to Cognito Hosted UI
- After login, signed cookie is set
- /user/content.json returns items for logged-in user
- /kids/content.json returns items only for users in kids Cognito group
- Logout clears cookie, role content disappears from feed
