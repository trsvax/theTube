---
title: Markdown Is a Programming Language
date: 2026-05-14
tags: [tech]
draft: true
summary: The Actions are the compiler. The markdown is the source. The syntax you define is the language.
issueNumber: 34
discussionNumber: 36
---

Every format that humans write and machines read eventually gets execution semantics pushed into it.

HTML was markup. Then came `onclick`. Then JavaScript in `<script>` tags. Then server-side templating engines treating HTML as a code surface. The format survived because it was loose — browsers rendered broken markup rather than rejecting it. Strictness came later, optionally.

XHTML tried to force the strictness first. It lost.

## The compiler insight

When a `[design]:` line in a markdown post creates a GitHub issue, generates a placeholder image, and gates a deploy — that's a side effect. That's execution. The markdown isn't describing work, it's causing it.

But the markdown itself isn't executing anything. The GitHub Action is. The markdown is source. The Action is the compiler. The `[design]:` syntax is a language feature you designed; the compiler implements it.

That's exactly how high-level languages work: the spec is separate from the implementation, and the implementation has a lot of latitude.

## Maven proved the wrong lesson

Maven's `pom.xml` is XML as a programming surface — declarative, opinionated, and famous for being miserable to write. The XML _was_ the bytecode. There was no separation between spec and implementation. You weren't writing logic; you were fighting a convention system expressed in 200 lines of angle brackets.

The lesson people took from Maven: XML is bad. The real lesson: coupling the spec to the implementation is bad. The strictness tax killed the writability.

## Loose spec, compiler does the work

The looser the spec, the lower the barrier. The lower the barrier, the more people write. The more people write, the more you learn what the language actually needs. Then you refine.

Postel's law was baked into HTML from the start — be liberal in what you accept. That's why the web grew. YAML tried to split the difference between human-writable and machine-parseable and ended up with significant-whitespace bugs and the GitHub Actions indentation tax.

Markdown with a GitHub Action compiler has the HTML property: write something close enough and it works. The parser skips what it doesn't recognize. The posts that exist keep working as the language evolves.

The git log is the spec history. You can see when `[design]:` gained the `alt:` field. The markdown files are the archaeological record of the language's evolution — same as looking at early HTML and finding `<blink>`.
