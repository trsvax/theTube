---
title: Doug McIlroy Would Recognize It
date: 2026-05-15
tags: [tech]
draft: true
summary: Unix got it right in 1969. Small tools, text streams, compose at the shell. The web spent 50 years building walls around that idea. Markdown files and git repos are building it back.
issueNumber: 68
discussionNumber: 70
---

Unix got it right in 1969 and the industry spent 50 years building walls around it.

The Unix model was four rules: small tools that do one thing, stdin/stdout as the universal interface, compose at the shell not inside the app, files as the persistence layer. Doug McIlroy's pipes were the key insight — the format agreement that made composition possible without coordination.

The web broke this. Apps became monoliths because HTTP replaced pipes and databases replaced files. The composition layer disappeared. You can't pipe a Slack message into Jira the way you can pipe `grep` into `awk`. Each application absorbed its neighbors rather than connecting to them.

## ASCII text as the data stream

Unix pipes work because every tool agrees: text in, text out. No binary formats, no schemas, no version negotiation. The format is human-readable by definition, which means it's also tool-readable by definition. `cat` works on everything. `grep` works on everything.

Markdown is the same bet. Any tool can read it — an editor, a renderer, an AI, a bash script counting word frequency. No parser needed beyond "look for lines starting with `#`." The frontmatter is just more ASCII: `key: value`, nothing exotic.

The reason XML and JSON partially replaced flat text was structure — nested data that flat text couldn't express. But for content, flat text with light conventions is almost always enough. The nesting is the problem, not the solution. The moment you need a schema validator you've already lost the simplicity.

YAML frontmatter is the one concession — structured metadata on top of unstructured content. It works because the structure is shallow. One level deep, string values, the occasional array. The moment frontmatter needs nested objects, something has gone wrong in the content model.

## Git repos as the filesystem

S3 is the deployed filesystem. The git repo is the source filesystem. Markdown files are the data. GitHub Actions is the shell — reads from one repo, writes to another, triggers on events. `grep | awk | sed` becomes `checkout | build | sync`.

Each tool in the stack does one thing. The static site renderer reads markdown and writes HTML. The deploy step reads HTML and writes to S3. The CloudFront function reads a URI and rewrites it. None of them know about each other. They agree on the format — files, paths, HTTP — and compose through that agreement.

## The missing piece

Unix had one thing this doesn't yet: discoverability. On Unix you can `man` any tool and know its interface — what it reads, what it writes, what flags it accepts. Without that, composition requires someone who already knows both tools.

`AGENTS.md` is the man page for a repo. Here's what this tool reads, here's what it writes, here's how to compose it with something else. Right now AGENTS.md is written for someone working on the project. It should also be written for someone composing it with another project.

The whole theTube stack is the Unix bet applied to publishing: markdown files as the data stream, Actions as the pipe, S3 as the filesystem. Small tools, clear interfaces, compose at the shell.

Doug McIlroy would recognize it.

[journey]:
prev: markdown-is-a-programming-language
next: any-tool-that-doesnt-use-the-repo
From a conversation about project reuse, git-as-filesystem, and the Unix pipe model. Started with gitSlack as a hypothetical repo-backed Slack, ended with McIlroy. The ASCII text observation came from the user — markdown is just the Unix pipe convention applied to content.
