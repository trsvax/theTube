---
title: The Site Map Is a Graph
date: 2026-05-14
tags: [tech]
draft: true
summary: Posts link to each other through the journey block. prev, next, forks. The build already has enough to draw the graph.
issueNumber: 46
discussionNumber: 48
---

Every post knows where it came from and where it went. `prev` and `next` in the `[journey]:` block. Forks when the thinking branched. All optional, all in the file.

That's a graph. The build reads it at compile time — same pass that generates the redirect rules and the post index. Nodes are posts. Edges are journey links. Forks branch.

The output is an SVG sitemap. Not the `sitemap.xml` that search engines want — a visual map of how the thinking moved. Which posts spawned which. Where the journal forked and whether the branches reconnected.

The `[design]:` block specs it:

```
[design]: sitemap.svg — journey graph, all published posts, forks visible
src: data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjYzMCIgdmlld0JveD0iMCAwIDEyMDAgNjMwIj4KICA8cmVjdCB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MzAiIGZpbGw9IiNmNWY1ZjUiLz4KICA8cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iMTE5MiIgaGVpZ2h0PSI2MjIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2NjYyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSI4IDQiLz4KICA8dGV4dCB4PSI2MDAiIHk9IjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjMyIiBmaWxsPSIjYmJiIj5zaXRlbWFwLnN2ZzwvdGV4dD4KICA8dGV4dCB4PSI2MDAiIHk9IjMxNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjUiIGZpbGw9IiM4ODgiPmpvdXJuZXkgZ3JhcGgsIGFsbCBwdWJsaXNoZWQgcG9zdHMsIGZvcmtzIHZpc2libGUgYGBgPC90ZXh0Pgo8L3N2Zz4=
```

The post that describes the structure of the site, built by the same workflow the site runs on.

[journey]:
prev: url-aliases
Came from the observation that prev/next in the journey block is already a graph. If every post knows its neighbors, the build has enough to draw the whole thing. The [design]: block specs the output image — recursive in the right way.
