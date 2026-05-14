---
title: Chaos Development
date: 2026-05-14
tags: [tech]
draft: true
summary: The methodology nobody writes about because it doesn't make for a clean conference talk. Real development is continuous reconciliation, not plan execution.
issueNumber: 53
discussionNumber: 55
---

The editor resurrects your deleted file. The bot commits over your push. The designer delivers `logo-FINAL-v2-USE-THIS.png`. The DNS TTL means the redirect you just deployed won't work for another hour.

You're not executing a plan. You're continuously reconciling the state of the world with where you thought it was.

The tools pretend otherwise. Jira has a board. The board has swimlanes. The swimlanes have stories. None of it reflects what actually happened on Tuesday.

Agile was supposed to fix this. It added ceremonies to the chaos instead. Daily standups to report on the chaos. Retrospectives to discuss why the chaos happened. Sprint planning to project the next chaos in advance.

Chaos development is just admitting that `git rebase` is the actual methodology. The world changed while you were working. Reconcile, continue.

[journey]:
prev: designers-dont-know-git
next: cruise-ship-vs-wandering
Named during a conversation about the bot wars — the workflow writing back to frontmatter on every push, the editor resurrecting deleted files, the stash-rebase-pop dance becoming the default push sequence. "Herding cats" led to "chaos development" led to the cruise ship metaphor.
