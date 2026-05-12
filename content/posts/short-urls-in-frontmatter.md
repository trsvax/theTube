---
title: Short URLs in the Frontmatter
date: 2026-05-12
tags: [tech]
audience: user
summary: A short URL in a post's frontmatter, a CloudFront function generated at build time. No Bitly, no database, no link rot.
---

Bitly exists because short URLs are useful and nobody wants to manage the redirect infrastructure themselves. You trade your link data and a monthly subscription for a domain you don't own, a service that changes its free tier, and URLs that stop working if you ever stop paying.

There's a simpler version.

## The idea

Add a `shortSlug` to the post frontmatter:

```markdown
---
title: Replacing Enterprise Publishing for $1 a Month
shortSlug: ep1
---
```

At build time, collect every `shortSlug` across all posts and generate a CloudFront function:

```js
// generated at build time — do not edit
const SLUGS = {
  ep1: "/posts/enterprise-publishing-for-a-dollar",
  bts: "/posts/building-the-tube",
};

function handler(event) {
  const uri = event.request.uri.slice(1); // strip leading /
  const target = SLUGS[uri];
  if (target) {
    return {
      statusCode: 301,
      statusDescription: "Moved Permanently",
      headers: { location: { value: target } },
    };
  }
  return event.request;
}
```

Deploy that function attached to the CloudFront distribution. `thetube.today/ep1` redirects to the full post URL. Done.

## Why CloudFront functions

CloudFront Functions run at the edge before the request hits S3. No Lambda cold start, no origin request, no database lookup. The redirect happens in under a millisecond, globally, and the free tier covers two million invocations a month.

The slug map is compiled into the function at deploy time. It's not a dynamic lookup — it's a constant. The tradeoff is that adding a new short URL requires a deploy. For a blog, that's fine; you're already deploying when you publish a post.

## The build step

The existing build script reads frontmatter for every post. One more pass to collect `shortSlug` values and write the function source to a file. The deploy workflow uploads it via the AWS CLI or CDK.

```ts
const slugMap = posts
  .filter((p) => p.shortSlug)
  .reduce((acc, p) => ({ ...acc, [p.shortSlug]: `/posts/${p.slug}` }), {});
```

A JSON object written into a function template. Straightforward.

## What you get

- Short URLs that belong to your domain, not Bitly's
- No monthly subscription
- No link rot — the redirect lives in the same repo as the post
- The `shortSlug` is in version control, so the history of "when did this URL exist" is the git log
- Works in print, on slides, in email — anywhere you want a short URL that's easy to type

The slug is part of the post. The post is source code. The redirect is compiled output. Same model as everything else.
