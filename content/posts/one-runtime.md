---
title: The Browser Didn't Win on Merit
date: 2026-05-14
tags: [tech]
draft: true
summary: Client-server died not because the browser was better software, but because one runtime for everything was an overwhelming operational advantage. Web 2.0 kept that win and threw out everything else.
issueNumber: 65
discussionNumber: 67
---

Before the web, every application was its own runtime. Lotus Notes. SAP GUI. Oracle Forms. Your HR system. Each one installed separately, versioned separately, broken separately. IT managed a matrix — which version of which client worked on which OS, and who was allowed to upgrade first to find out what broke.

The browser didn't win because it was better software. It won because one runtime for everything was an overwhelming operational advantage. You stopped managing clients and started managing a single vendor relationship. Messy in a different way, but one kind of messy instead of five.

Web 2.0 kept that win and threw out everything else.

The original web had the right instinct: a URL is an address for a document. The document is permanent. You own it. Web 2.0 added participation — comments, social graphs, algorithmic feeds — but the price was the document. URLs stopped addressing documents and started addressing application state. `facebook.com/home` isn't a document. It's a view into a database that changes every thirty seconds and is different for everyone who visits it.

The feed replaced the page. You got to reply to things, but you lost the thing.

Electron completed the circle. Slack, VS Code, Figma — each ships its own Chromium. The install-per-app problem is back, with the added indignity that the runtime is a whole browser engine and the application is JavaScript. IT is back to managing a matrix of client versions.

The browser won. Then we built client-server inside it.

[journey]:
prev: designers-dont-know-git
From a conversation about what went wrong between Web 1.0 and Web 2.0, starting from the observation that client-server's actual problem was the install matrix, not the programming model.
