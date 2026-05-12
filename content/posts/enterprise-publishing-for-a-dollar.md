---
title: Replacing Enterprise Publishing and Full-Service Hosting for $1 a Month
date: 2026-05-12
tags: [tech]
audience: user
summary: Every feature on the enterprise CMS checklist, no server, no managed hosting. $1 a month.
---

The standard knock on static sites is that they can't do what "real" publishing platforms do. CMS vendors have a long list: editorial workflow, comments, analytics, multi-language, email newsletters, subscriber management, audit logs, A/B testing. The implication is that you need a managed platform to get any of it.

I went through the list. Most of it is already solved, either by tools I'm already using or by the browser.

## Editorial workflow

Draft, review, approve, publish. That's a branch, a pull request, merge to main. Inline comments on specific lines of text. Full diff between every draft. The entire history, attributed and timestamped, cryptographically signed if you bother with commit signing.

Most CMS audit logs tell you "user X clicked publish at time Y." Git shows you exactly what changed, word by word. It's better than most enterprise audit systems, and it ships with the tool you're already using to write code.

## Comments

GitHub Issues. Fetch at build time, bake into the HTML. Editorial gate via a `published` label — I read everything, I decide what goes on the site. Anyone who thinks I'm hiding something can look at the unfiltered issue list directly. The link is right there.

Reactions on the issue body are votes. The API sorts by `reactions-+1`. A ranked list of what readers want most, no plugin required.

Issue templates set expectations for comments, corrections, and post ideas. Three files in `.github/ISSUE_TEMPLATE/`. Done.

## Analytics

One script tag. Plausible or Fathom — privacy-friendly, no cookies, no GDPR banner, no surveillance capitalism. Page views, referrers, geography. Five minutes.

## Multi-language

The browser translates the page. Chrome, Safari, Firefox — built in, one click, works on every site without you doing anything. This is not a problem you need to solve.

## Audit log

See: editorial workflow. Git is an audit log.

## Subscriber management

The subscriber list is already in Cognito. Anyone who logs in is a user. The `email` group is the newsletter list. Unsubscribe is removing yourself from the group. No separate database, no opt-in flow to build — they already authenticated to get in.

## Email newsletters

SES. Post publishes, GitHub Action fires, Lambda fetches the `email` group from Cognito, sends via SES. SES handles the `List-Unsubscribe` header, the one-click unsubscribe that Gmail and Apple Mail show at the top. CAN-SPAM compliance: handled.

The hard part of email is usually subscriber management. Cognito already did that.

## User settings

No database needed. Cognito is the database. A settings page calls a Lambda that updates Cognito group membership and user attributes. Notification preferences, unsubscribe from email, delete account — all Cognito API calls, verified by the JWT the user already has.

## What actually costs money

- S3: cents
- CloudFront: cents
- Cognito: free up to 50,000 monthly active users
- Lambda: effectively free at this scale
- SES: $0.10 per 1,000 emails
- GitHub: free for public repos

The domain is the biggest line item.

## What's left

RSS. Scheduled publish — write ahead, ship at a specific time. Both are on the list; neither is hard. RSS is a build step that writes an XML file. Scheduled publish is a cron workflow that checks a `publish-date` frontmatter field.

That's it. Everything else on the enterprise checklist is either solved, handled by the browser, or a GitHub feature.

The site costs about $1 a month. The CMS is free. The feature gap is essentially zero.

## Content is source code

`marked` compiles Markdown to HTML the same way `gcc` compiles C to machine code. Source goes in, artifact comes out, the build pipeline doesn't care what the text means.

If the content is generated from your direction — your ideas, your decisions, your voice — the distinction between writing and programming gets thin. You're the architect either way. The publishing toolchain and the software toolchain are identical: text files, version control, branches for drafts, CI/CD to ship.

The CMS industry spent 20 years insisting publishing was a different problem that needed different tools. The repo says otherwise. The git history says otherwise. The build pipeline says otherwise.
