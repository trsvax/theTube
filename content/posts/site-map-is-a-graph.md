---
title: The Site Map Is a Graph
date: 2026-05-14
tags: [tech]
draft: true
summary: Posts link to each other through the journey block. prev, next, forks. The build already has enough to draw the graph.
---

Every post knows where it came from and where it went. `prev` and `next` in the `[journey]:` block. Forks when the thinking branched. All optional, all in the file.

That's a graph. The build reads it at compile time — same pass that generates the redirect rules and the post index. Nodes are posts. Edges are journey links. Forks branch.

The output is an SVG sitemap. Not the `sitemap.xml` that search engines want — a visual map of how the thinking moved. Which posts spawned which. Where the journal forked and whether the branches reconnected.

The `[design]:` block specs it:

```
[design]: sitemap.svg — journey graph, all published posts, forks visible
```

The post that describes the structure of the site, built by the same workflow the site runs on.
