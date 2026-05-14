---
title: One URL Per Branch
date: 2026-05-14
tags: [tech]
draft: true
summary: Every branch gets a real deployment. Not a build artifact — a URL you can click. The bot writes back to the branch it was triggered from, not main.
issueNumber: 62
discussionNumber: 64
---

The minimal CI/CD model is: push to main, deploy to production. It works until you push a broken CloudFront function and the site 502s for everyone.

The fix isn't a staging checkbox. It's a URL per branch.

`main` → `thetube.today`. `dev` → `dev.thetube.today`. Any branch → a preview URL derived from the branch name. GitHub Actions has `github.ref_name`. The workflow routes automatically. S3 prefix per branch, one CloudFront distribution with wildcard subdomain on the cert.

The bot's write-back commits go to whichever branch triggered the workflow — not main. That's the correct behavior. The issue numbers land in a PR, you review, you merge. Production only changes when you decide it does.

The difference from "staging environment": staging is a separate system you have to keep in sync. A branch deployment is the same build pipeline, same infrastructure, different prefix. It diverges from production only by what's in the branch — which is exactly what you want to test.

You can click the URL. That's the whole thing. Artifacts you can't visit aren't staging, they're just compressed files.

[journey]:
prev: designers-dont-know-git
The 502 from the CloudFront function bug made the case. Every push to main is live. A broken URI rewrite is immediately a broken site. The fix was one push away, but that's one push where nobody could visit the root URL. A dev branch with its own URL would have caught it before it touched production.
