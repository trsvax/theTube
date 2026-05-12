---
title: What You'd Pay to Buy This Off the Shelf
date: 2026-05-12
tags: [tech]
audience: user
summary: A plain-English comparison of this blog's stack versus the commercial products that do the same things.
---

This blog does a lot. Public posts anyone can read. Posts behind a login. Posts only certain people can see. A newsletter. Comments. A workflow for writing and publishing. A CDN that serves the whole thing fast, from anywhere in the world.

If you wanted to buy all of that from commercial vendors — the way most people build something like this — here's what it would cost.

## The blog itself

A hosted platform like **Ghost Pro** starts at $36/month. **Squarespace** is $23–65/month. **WordPress.com** Business plan is $45/month. These include hosting and basic CMS features. They don't include membership, gated content, or a real CDN.

**Webflow** — the more design-forward option — starts at $23/month for a basic site and goes to $49/month before you add a CMS, then more for members.

theTube equivalent: the hosting is S3 + CloudFront. About **$1/month**.

## Membership and gated content

Letting people log in, showing different content to different people, and managing who's in which group is a separate product category.

**Memberstack** starts at $49/month. **Memberful** is $49/month. **Auth0** — the enterprise identity platform — is $240+/month for anything beyond the free tier's basic features.

theTube uses **AWS Cognito**. Free for the first 50,000 monthly active users. The auth flow — Google login, email signup, groups, role-based content — is all Cognito, built once, costs nothing to run.

## Newsletter

**Mailchimp** charges $20/month for a small list. **Kit** (formerly ConvertKit) starts at $29/month. **Beehiiv** is $39/month. **Substack** takes 10% of paid subscription revenue.

None of them know who your members already are. You'd import a list, manage unsubscribes separately, and keep two systems in sync.

theTube: the subscriber list is already in Cognito. Sending email is **AWS SES** — $0.10 per 1,000 emails. One Lambda function, no third-party subscription, no separate list to manage.

## Comments

**Disqus** is free if you're okay with ads on your site. Remove the ads: $11/month. **Commento** is $5/month. Both require moderation tools, spam filtering, and trust that the company stays in business.

theTube uses **GitHub Issues**. Free. Readers file an issue; I decide what goes on the site. The full unfiltered list is public — anyone who thinks I'm hiding something can look. No spam database, no plugin to maintain.

## Analytics

**Fathom** is $14/month. **Plausible** is $9/month. Google Analytics is free but tracks your readers and requires a cookie consent banner.

theTube: Plausible. **$9/month**, privacy-respecting, no banner, no data sold. This is the one line item that's the same.

## Workflow

When I write a post, a ticket is automatically created in GitHub. There's a tracking ticket that closes when the post publishes, and a discussion ticket that stays open. If a post needs design work, a sub-ticket is created with a delivery path. The whole history of every draft is version-controlled.

The commercial equivalent of this is **Contentful** ($300+/month for a team) or **Jira** ($8.15/user/month) bolted onto a CMS. Most bloggers don't bother — they publish from a WYSIWYG editor and have no record of what changed or when.

theTube: **GitHub**. Free for public repositories.

## CDN

A **content delivery network** is what makes a website fast from anywhere. Instead of one server in Virginia, your content is cached at dozens of locations around the world. When someone in Tokyo reads a post, they get it from Tokyo, not Virginia.

**Fastly** and **Akamai** — the enterprise CDNs — start at hundreds of dollars a month and require contracts. Managed platforms include CDN but at a shared, throttled tier. Netlify's CDN is free up to 100GB of bandwidth, then $20/100GB.

theTube: **CloudFront**, Amazon's CDN. At this traffic level, it's cents.

## What it adds up to

| What it does | Commercial option | Monthly cost | theTube |
|---|---|---|---|
| Blog platform + hosting | Ghost Pro | $36 | S3 + CloudFront: ~$1 |
| Membership + gated content | Memberstack | $49 | Cognito: $0 |
| Newsletter | Kit | $29 | SES: ~$0 |
| Comments | Disqus (no ads) | $11 | GitHub Issues: $0 |
| Analytics | Plausible | $9 | Plausible: $9 |
| Workflow | Jira | $8 | GitHub: $0 |
| CDN | Netlify Pro | $19 | Included above |

**Commercial total: ~$161/month. theTube: ~$10/month** (mostly the domain and Plausible).

## What you don't get from a commercial platform

The price gap is real, but the more interesting difference is what managed platforms can't offer.

**Ownership.** Your content, your data, your infrastructure. If Squarespace raises prices or shuts down, you're on deadline to migrate. theTube's content is a folder of text files. It runs anywhere.

**Version history.** Every draft of every post is recorded, attributed, and timestamped. Who changed what, when, and what it looked like before. Commercial CMS platforms log that someone clicked "publish." Git logs every word.

**Lock-in is the business model.** Managed platforms make migration painful on purpose. Custom fields, plugins, themes — they don't export cleanly. The exit cost is the retention strategy. Plain Markdown files export to nothing because they're already nothing — just text.

## The honest counterargument

Commercial platforms are easier to start. You sign up, pick a theme, and publish in an afternoon. No AWS account, no GitHub Actions, no build pipeline. That's real, and for most people it's the right choice.

The tradeoff is: easy to start, increasingly expensive to stay, and impossible to fully own.

theTube took longer to build. It's cheaper to run, more capable, and everything it does is documented and version-controlled. The first month was setup. Every month after is $10.
