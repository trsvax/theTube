---
title: Short URLs in the Frontmatter
date: 2026-05-12
tags: [tech]
audience: user
shortSlug: su
summary: A short URL in a post's frontmatter, a CloudFront function generated at build time. No Bitly, no database, no link rot.
---

For some reason before 2020 I thought I needed a business card. I made it an odd size so it stuck out in a stack. The front was a JSON object and my vismon on the back. Since it was a smaller card I could only fit `{ name, email, url }` and the URL had to be short. It pointed to a GitHub gist, and if someone could figure that out they could call me. Never got a call.

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
const SLUGS = {
  ep1: "/posts/enterprise-publishing-for-a-dollar",
  bts: "/posts/building-the-tube",
};

function handler(event) {
  const uri = event.request.uri.slice(1);
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

Deploy

## Why CloudFront functions

CloudFront Functions run at the edge before the request hits S3. The redirect happens in under a millisecond, globally, and the free tier covers two million invocations a month.

The deploy is the insert.

## The build step

The existing build script reads frontmatter for every post. One more pass to collect `shortSlug` values and write the function source to a file. The deploy workflow uploads it via the AWS CLI or CDK.

```ts
const slugMap = posts
  .filter((p) => p.shortSlug)
  .reduce((acc, p) => ({ ...acc, [p.shortSlug]: `/posts/${p.slug}` }), {});
```

## What you get

- Short URLs that belong to your domain
- No monthly subscription
- No link rot — the redirect lives in the same repo as the post
- The file is the spec — the post declares its own short URL
- Works in print, on slides, in email — anywhere you want a short URL that's easy to type

The slug is part of the post. The post is source code. The redirect is compiled output. Same model as everything else.
