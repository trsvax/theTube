# Blocks

Registry of `[block]:` extensions. How to use them and where their specs live.

| Block | Usage | Spec |
|---|---|---|
| `[journey]:` | Running log. Add to it as work progresses. Renders as `<details>`. | built-in (`lib/posts.ts`) |
| `[design]:` | Visual asset brief. Renders as `<img>` when `src:` present, placeholder when missing. | built-in (`lib/posts.ts`) |
| `[spec]:` | Spec conversation. Renders as `<details>`. | built-in (planned) |
| `[comment]:` | Enables comments on this post. Renders a comment form and displays existing comments. | [trsvax/thetube-comments](https://github.com/trsvax/thetube-comments) |
| `[comment]:` | Processes comment events from the log, writes comment files. | comment indexer (planned) |

Multiple repos can respond to the same block. Not a collision — a collaboration. Each reader does its own thing.

The spec URL is for implementation. Day-to-day usage: just add the block to a post. AI knows what to do from this file.
