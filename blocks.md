# Blocks

Registry of `[block]:` extensions and where their specs live.

| Block | Spec | Description |
|---|---|---|
| `[journey]:` | built-in (`lib/posts.ts`) | Running log of the implementation. Renders as `<details>`. |
| `[design]:` | built-in (`lib/posts.ts`) | Visual asset brief. Renders as `<img>` or placeholder. Creates GitHub issue. |
| `[spec]:` | built-in (planned) | Spec conversation. Renders as `<details>`. |
| `[comment]:` | [trsvax/thetube-comments](https://github.com/trsvax/thetube-comments) | Comment form and display. Schema defines operations. |
| `[comment]:` | comment indexer (planned) | Processes comment events from the log, writes comment files. |

Multiple repos can respond to the same block. Not a collision — a collaboration. Each reader does its own thing with the same block.
