---
title: The Block Is the API
date: 2026-05-14
tags: [tech]
draft: true
summary: "[name]: is a namespace. Any tool that knows about it can act on it. Tools that don't, ignore it. The file stays valid markdown either way."
---

`[design]:` creates a GitHub issue. `[journey]:` renders navigation. `[product]:` could create a Stripe listing. Same file, different readers, no coordination required.

```
[product]: coffee-mug.png — 12oz, matte black, logo on both sides
price: 24.00
sku: MUG-001
```

The workflow creates the product, generates the image brief, writes the SKU back to frontmatter. The post is the product page and the catalog entry at the same time. The reader sees prose. The commerce workflow sees a structured brief.

The pattern: `[name]:` is a namespace. You define it, write the parser, wire the Action. The post author writes the block; the right thing happens downstream. New reader, new block type, no changes to existing posts. Tools that don't know the namespace skip it. The file stays valid markdown either way.

This is an extensible protocol, not a CMS. The difference: a CMS owns the schema and you adapt to it. Here you define the schema in the block, and the tools adapt to you.

The post is the API surface. The blocks are the endpoints.

[journey]:
prev: designers-dont-know-git
The ecommerce question came up naturally — if [design]: briefs a designer, what else could a block brief? The answer is anything with a workflow: tasks, reviews, events, products. The namespace is the extension point. No changes to the core, no new config, just a new block type and a new reader.
